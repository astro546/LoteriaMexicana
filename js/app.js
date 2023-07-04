import { cartas } from './loteria.js';
const boardBoxes = Array.from(document.querySelectorAll('.board-box'));
const currentCard = document.querySelector('#current-card-display');
const progressBar = document.querySelector('#progress-bar');
const imgCurrentCard = document.createElement('IMG');

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

function timer() {
  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressBar.style.width = `${progress}%`;
    if (progress >= 100) {
      progressBar.style.width = `0%`;
    }
  }, 1000);
}

// timer();

progressBar.style.width = '100%';
