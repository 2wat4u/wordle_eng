// Sélectionner les éléments DOM
const gameBoard = document.getElementById('game-board');
const keyboard = document.getElementById('keyboard'); // Clavier virtuel
let words = [];
let secretWord = "";
let currentRow = 0;
let currentCol = 0;

// Charger les mots depuis le fichier JSON
document.addEventListener('DOMContentLoaded', () => {
    fetch('./words_eng.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors du chargement du fichier JSON');
            }
            return response.json();
        })
        .then(data => {
            words = data.words;
            console.log("Mots chargés :", words);
            startNewGame();
        })
        .catch(error => console.error('Erreur:', error));
});

// Fonction pour démarrer un nouveau jeu
function startNewGame() {
    if (!document.querySelectorAll('.key').length) {
        console.error("Erreur : Clavier non initialisé !");
        return;
    }

    currentRow = 0;
    currentCol = 0;
    resetGameBoard();
    resetKeyboard(); // Réinitialiser les couleurs du clavier

    if (words.length === 0) {
        console.error("Erreur : Aucun mot disponible !");
        alert("Erreur : aucun mot n'est disponible pour le jeu !");
        return;
    }

    // Sélectionner un mot au hasard
    secretWord = words[Math.floor(Math.random() * words.length)].toLowerCase();
    console.log("Mot choisi :", secretWord);
}

// Fonction pour réinitialiser le tableau de jeu
function resetGameBoard() {
    gameBoard.innerHTML = ""; // Effacer le tableau actuel
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 5; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-row', row);
            cell.setAttribute('data-col', col);
            gameBoard.appendChild(cell);
        }
    }
}

// Réinitialiser les couleurs du clavier
function resetKeyboard() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent'); // Supprimer les classes
        key.removeAttribute('style'); // Supprimer tous les styles inline
    });
}

// Gérer les entrées clavier physiques
document.addEventListener('keydown', (event) => handleInput(event.key));

// Gérer les clics sur le clavier virtuel
keyboard.addEventListener('click', (event) => {
    const key = event.target.textContent.trim(); // Obtenir le texte de la touche
    if (event.target.classList.contains('key')) {
        if (event.target.classList.contains('backspace')) {
            handleInput('Backspace');
        } else if (event.target.classList.contains('enter')) {
            handleInput('Enter');
        } else {
            handleInput(key);
        }
    }
});

// Fonction pour gérer les entrées (clavier physique et virtuel)
function handleInput(key) {
    key = key.toLowerCase();

    if (/^[a-z]$/.test(key) && currentCol < 5) {
        const cell = document.querySelector(
            `.cell[data-row="${currentRow}"][data-col="${currentCol}"]`
        );

        // Ajouter la lettre dans la cellule
        cell.textContent = key.toUpperCase();

        // Ajouter une animation
        cell.classList.add('animate');
        setTimeout(() => {
            cell.classList.remove('animate');
        }, 300);

        currentCol++;
    } else if (key === 'backspace' && currentCol > 0) {
        currentCol--;
        const cell = document.querySelector(
            `.cell[data-row="${currentRow}"][data-col="${currentCol}"]`
        );

        // Effacer la lettre dans la cellule
        cell.textContent = "";
    } else if (key === 'enter' && currentCol === 5) {
        const guess = Array.from(
            document.querySelectorAll(`.cell[data-row="${currentRow}"]`)
        )
            .map(cell => cell.textContent)
            .join("")
            .toLowerCase();

        validateGuess(guess);
    }
}

// Valider le mot entré
function validateGuess(guess) {
    // Vérifier si le mot existe dans la liste des mots
    if (!words.includes(guess)) {
        shakeCurrentRow();

        // Afficher un message temporaire après une courte pause
        setTimeout(() => {
            showTemporaryMessage("This is not a valid word !");
            clearCurrentRow();
        }, 500); // Correspond à la durée de l'animation de vibration

        return; // Empêche l'utilisateur d'avancer à la ligne suivante
    }

    applyColors(guess);

    // Retarder la vérification de la victoire/défaite jusqu'à la fin des animations
    setTimeout(() => {
        if (guess === secretWord) {
            playWinAnimation(); // Lancer l'animation de victoire

            // Afficher un message temporaire pour la victoire
            setTimeout(() => {
                showTemporaryMessage("Awesome ! You found the word !", 3000);

                // Effacer le tableau après la disparition du message
                setTimeout(() => {
                    clearGameBoard(); // Effacer toutes les lettres du tableau
                    startNewGame(); // Redémarrer une nouvelle partie
                }, 3000); // Correspond à la durée d'affichage du message temporaire
            }, 2000); // Attendre la fin de l'animation de victoire
        } else if (currentRow === 5) {
            // Afficher un message temporaire pour la défaite
            showTemporaryMessage(`You lost ! The word was: ${secretWord.toUpperCase()}`, 3000);

            // Effacer le tableau après la disparition du message
            setTimeout(() => {
                clearGameBoard(); // Effacer toutes les lettres du tableau
                startNewGame(); // Redémarrer automatiquement une nouvelle partie
            }, 3000); // Correspond à la durée d'affichage du message temporaire
        } else {
            currentRow++;
            currentCol = 0;
        }
    }, 600 + 300 * 5); // Attendre la fin des animations (600ms + 300ms x 5 lettres)
}

// Effacer toutes les lettres du tableau
function clearGameBoard() {
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.textContent = ""; // Supprimer le contenu textuel
        cell.className = 'cell'; // Réinitialiser les classes CSS
    });
}




function shakeCurrentRow() {
    const rowCells = document.querySelectorAll(`.cell[data-row="${currentRow}"]`);

    if (rowCells.length > 0) {
        // Ajouter la classe 'shake' à toutes les cellules de la ligne
        rowCells.forEach(cell => {
            cell.classList.add('shake');
        });

        // Supprimer la classe après l'animation pour pouvoir réutiliser l'effet
        setTimeout(() => {
            rowCells.forEach(cell => {
                cell.classList.remove('shake');
            });
        }, 500); // Durée de l'animation définie en CSS
    }
}

// Effacer toutes les lettres de la ligne en cours
function clearCurrentRow() {
    const rowCells = document.querySelectorAll(`.cell[data-row="${currentRow}"]`);

    rowCells.forEach(cell => {
        cell.textContent = ""; // Supprimer le contenu textuel
        cell.classList.remove('animate'); // Supprimer toute animation active
    });

    currentCol = 0; // Réinitialiser la position de la colonne
}



// Fonction pour gérer la couleur des touches du clavier
function updateKeyboard(letter, status) {
    const keyButton = Array.from(document.querySelectorAll('.key'))
        .find(button => button.textContent.trim().toUpperCase() === letter.toUpperCase());

    if (!keyButton) return; // Si aucune touche correspondante n'est trouvée

    // Supprimer les anciennes classes pour éviter les conflits
    keyButton.classList.remove('correct', 'present', 'absent');

    // Ajouter la classe correspondant au statut
    if (status === 'correct') {
        keyButton.classList.add('correct');
    } else if (status === 'present') {
        keyButton.classList.add('present');
    } else if (status === 'absent') {
        keyButton.classList.add('absent');
    }
}

// Appliquer les couleurs aux lettres avec animation et mise à jour du clavier
function applyColors(guess) {
    const letterCount = {};

    // Compter les occurrences des lettres dans le mot secret
    for (const letter of secretWord) {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    }

    const rowCells = document.querySelectorAll(`.cell[data-row="${currentRow}"]`);

    guess.split("").forEach((letter, index) => {
        const cell = rowCells[index];

        // Retarder l'animation pour créer un effet en cascade
        setTimeout(() => {
            cell.classList.add('flip'); // Ajouter l'animation de rotation

            // À mi-parcours, modifier la couleur et la bordure
            setTimeout(() => {
                if (letter === secretWord[index]) {
                    cell.classList.add('correct');
                    updateKeyboard(letter, 'correct');
                    letterCount[letter]--;
                } else if (secretWord.includes(letter) && letterCount[letter] > 0) {
                    cell.classList.add('present');
                    updateKeyboard(letter, 'present');
                    letterCount[letter]--;
                } else {
                    cell.classList.add('absent');
                    updateKeyboard(letter, 'absent');
                }
            }, 300); // À mi-parcours de l'animation

            // Retirer la classe flip après l'animation complète
            setTimeout(() => {
                cell.classList.remove('flip');
            }, 600); // Durée totale de l'animation
        }, index * 300); // Décalage constant entre chaque lettre
    });
}

// Fonction pour jouer l'animation de victoire
function playWinAnimation() {
    const rowCells = document.querySelectorAll(`.cell[data-row="${currentRow}"]`);

    rowCells.forEach((cell, index) => {
        setTimeout(() => {
            cell.classList.add('win-flip'); // Appliquer l'animation de victoire

            // Optionnel : Supprimer la classe après l'animation pour permettre un nouveau jeu
            setTimeout(() => {
                cell.classList.remove('win-flip');
            }, 1800); // Correspond à la durée totale de l'animation
        }, index * 100); // Décalage constant entre chaque cellule
    });
}

function showTemporaryMessage(message, duration = 2000) {
    // Créer l'élément pour le message temporaire
    const messageBox = document.createElement('div');
    messageBox.textContent = message;
    messageBox.className = 'temporary-message';
    document.body.appendChild(messageBox);

    // Supprimer le message après la durée spécifiée
    setTimeout(() => {
        messageBox.remove();
    }, duration);
}



