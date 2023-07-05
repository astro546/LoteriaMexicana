import { cartas } from './loteria.js';

// Variables de la pagina de seleccion de variables
let gameMode;
const modes = document.querySelectorAll('.game-mode');

// Variables de la pagina de juego
const boardBoxes = Array.from(document.querySelectorAll('.board-box'));
const currentCard = document.querySelector('#current-card-display');
const progressBar = document.querySelector('#progress-bar');
const imgCurrentCard = document.createElement('IMG');

// Cuando se selecciona un modo, este se guarda en gameMode antes de que se cambie de pagina
const selectGameMode = new Promise((resolve) => {
  document.addEventListener('DOMContentLoaded', () => {
    if (modes) {
      modes.forEach((mode) => {
        mode.addEventListener('click', (e) => {
          gameMode = e.target.id;
          resolve(gameMode);
          window.location.href = 'index.html';
        });
      });
    }
  });
});

selectGameMode.then((gameMode) => console.log(gameMode));
let i = 0;
boardBoxes.forEach((box) => {
  const imgCard = document.createElement('IMG');
  imgCard.src = cartas[i].img;
  imgCard.alt = cartas[i].nombre;
  box.appendChild(imgCard);
  i++;
});

imgCurrentCard.src = cartas[0].img;
imgCurrentCard.alt = cartas[0].nombre;
currentCard.appendChild(imgCurrentCard);

selectGameMode.then((gameMode) => console.log(gameMode));

progressBar.style.width = '0%';
