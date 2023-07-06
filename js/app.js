import { cartas } from './loteria.js';

// Variables de la pagina de seleccion de variables
let gameMode;
const modes = document.querySelectorAll('.game-mode');

// Variables de la pagina de juego
const boardBoxes = Array.from(document.querySelectorAll('.board-box'));
const currentCard = document.querySelector('#current-card-display');
const progressBar = document.querySelector('#progress-bar');
const imgCurrentCard = document.createElement('IMG');

// Variables de la logica del juego
const mainDeck = [...cartas];
const playerBoards = [];

// Cuando se selecciona un modo, este se guarda en gameMode antes de que se cambie de pagina
const selectGameMode = new Promise((resolve) => {
  document.addEventListener('DOMContentLoaded', () => {
    if (modes) {
      modes.forEach((mode) => {
        mode.addEventListener('click', (e) => {
          gameMode = e.target.id;
          resolve(gameMode);
          window.location.href = 'game.html';
        });
      });
    }
  });
});

// Cuenta regresiva inicial de la partida
function initialTimer() {
  // Coloca el temporizador inicial en pantalla
  let timer = 3;
  const timerDiv = document.createElement('DIV');
  const timerNumber = document.createElement('h2');
  timerDiv.id = 'timer';
  timerNumber.id = 'timer-number';
  timerNumber.textContent = `${timer}`;
  timerDiv.appendChild(timerNumber);
  document.body.appendChild(timerDiv);

  // Ejecuta la cuenta regresiva y elimina la alerta
  const initialTimerInterval = setInterval(() => {
    timerNumber.textContent = `${timer}`;
    timer--;
    if (timer === -1) {
      timerDiv.style.opacity = '0';
      clearInterval(initialTimerInterval);
    }
  }, 900);
}

function genIndex(boards) {
  // Parametros de la formula
  let s = Math.floor(Math.random() * 53);
  const a = 47;
  const c = 35;
  const m = 59;

  // Evita que se genere una semilla igual a otro tablero
  if (Array.isArray(boards) && boards.includes(s)) {
    while (boards.includes(s)) {
      s = Math.floor(Math.random() * 53);
    }
  }
  const x = [s];

  // Genera la sucesion de numeros aleatorios
  const limit = boards ? 15 : 53;
  for (let i = 0; i < limit; i++) {
    x.push((a * x[i] + c) % m);
  }

  // Verifica si hay numeros entre 0 y 53 que no estan en la sucesion
  const skippedNums = [];
  if (!boards) {
    for (let i = 0; i < 54; i++) {
      if (!x.includes(i)) {
        skippedNums.push(i);
      }
    }

    // Reemplaza los numeros mayores a 53 por los numeros que no estaban en la sucesion
    let replacedNum = 54;
    let indexReplacedNum;
    let remainingNumber;
    for (let skipedNum of skippedNums) {
      indexReplacedNum = x.indexOf(replacedNum);
      if (indexReplacedNum !== -1) {
        x[indexReplacedNum] = skipedNum;
      } else {
        remainingNumber = skipedNum;
      }
      replacedNum++;
    }

    // Si un numero mayor a 53 tampoco estaba en la sucesion, entonces el valor final de replacedNum sera reemplazado
    if (remainingNumber) {
      indexReplacedNum = x.indexOf(replacedNum);
      x[indexReplacedNum] = remainingNumber;
    }
  } else {
    // Reemplaza los numeros mayores a 53 para los tableros de los jugadores
    let i = 0;
    for (let num of x) {
      if (num >= 54) {
        let newNum = Math.floor(Math.random() * 53);
        if (x.includes(newNum)) {
          while (x.includes(newNum)) {
            newNum = Math.floor(Math.random() * 53);
          }
        }
        x[i] = newNum;
      }
      i++;
    }
  }

  // Si la sucesion solo genera puros 39, entonces vuelve a llamar a la funcion
  const set = new Set(x);
  if (set.size === 1) {
    let newX = genIndex(boards);
    return newX;
  }

  return x;
}

// Intercambia las cartas
function swap(index1, index2) {
  const temp = mainDeck[index1];
  mainDeck[index1] = mainDeck[index2];
  mainDeck[index2] = temp;
}

// Barajea las cartas del mazo principal y genera los tableros para los jugadores
function shuffleCards() {
  // Barajea el mazo de cartas principal
  const randomIndexesDeck = genIndex();
  for (let i = 0; i < 54; i++) {
    swap(i, randomIndexesDeck[i]);
  }

  // Genera los tableros para los jugadores
  let randomIndexesBoard = [];
  let board = [];
  const initialCards = [];
  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      initialCards.push(playerBoards[i - 1][0].num - 1);
    }
    randomIndexesBoard = genIndex(initialCards);
    for (let randomIndex of randomIndexesBoard) {
      board.push(cartas[randomIndex]);
    }
    playerBoards.push(board);
    board = [];
  }
}

function showCards(modeDisplayHTML) {
  // Muestra el tablero del jugador humano
  let i = 0;
  boardBoxes.forEach((box) => {
    const imgCard = document.createElement('IMG');
    imgCard.src = playerBoards[0][i].img;
    imgCard.alt = playerBoards[0][i].nombre;
    box.appendChild(imgCard);
    i++;
  });

  // Muestra la primera carta del mazo
  imgCurrentCard.src = mainDeck[0].img;
  imgCurrentCard.alt = mainDeck[0].nombre;
  currentCard.appendChild(imgCurrentCard);

  const modeDisplay = document.querySelector('#mode-display');
  modeDisplay.innerHTML += modeDisplayHTML;
}

function showMode(mode) {
  // Muestra el modo de juego
  const gMode = mode.slice(0, 6);
  let HTML;
  console.log(gMode);
  switch (gMode) {
    case 'mode-1':
      HTML = `
      <img
          class="game-mode-icon"
          id="mode-1-icon"
          src="/img/icons/Loteria-Columna.png"
          alt="row-icon"
        />
      `;
      break;
    case 'mode-2':
      break;
    case 'mode-3':
      break;
    case 'mode-4':
      break;
    case 'mode-5':
      break;
    default:
      break;
  }
  return HTML;
}

function startGame() {
  let modeDisplayHTML;
  selectGameMode.then((mode) => {
    modeDisplayHTML = showMode(mode);
    console.log(modeDisplayHTML);
    // console.log(mode);
  });

  // shuffleCards();
  // showCards(modeDisplayHTML);
}

// progressBar.style.width = '0%';
initialTimer();
startGame();
