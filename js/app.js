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
let winnerFunc;
let modeSet;
let gameOver = false;

// Cuando se selecciona un modo, este se guarda en gameMode antes de que se cambie de pagina
const selectGameMode = new Promise((resolve) => {
  document.addEventListener('DOMContentLoaded', () => {
    if (modes) {
      modes.forEach((mode) => {
        mode.addEventListener('click', (e) => {
          gameMode = e.target.id;
          sessionStorage.setItem('gameMode', gameMode);
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
  timerDiv.id = 'alert-timer';
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
      setTimeout(() => {
        timerDiv.remove();
        progressBar.style.animation = 'progress-animation 3s infinite';
      }, 100);
      clearInterval(initialTimerInterval);
    }
  }, 900);
}

// Genera los numeros aleatorios
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

// Muestra las cartas y tableros
function showCards() {
  // Muestra el tablero del jugador humano
  let i = 0;
  boardBoxes.forEach((box) => {
    const lastImg = box.querySelector('img');
    if (lastImg) {
      lastImg.remove();
    }
    const imgCard = document.createElement('IMG');
    imgCard.src = playerBoards[0][i].img;
    imgCard.alt = playerBoards[0][i].nombre;
    imgCard.classList.add('img-box');
    box.appendChild(imgCard);
    i++;
  });

  // Muestra la primera carta del mazo
  imgCurrentCard.src = mainDeck[0].img;
  imgCurrentCard.alt = mainDeck[0].nombre;
  currentCard.appendChild(imgCurrentCard);
}

// Muestra el modo de juego
function showMode() {
  // Muestra el modo de juego
  const modeDisplay = document.querySelector('#mode-display');
  const gameModeIcon = document.querySelector('.game-mode-icon');
  const gameModeTitleLast = document.querySelector('.game-mode-title');

  if (gameModeIcon && gameModeTitleLast) {
    gameModeIcon.remove();
    gameModeTitleLast.remove();
  }

  let id;
  let nomImg;
  let altImg;
  let gameModeTitle;
  switch (gameMode) {
    case 'mode-1':
      id = 1;
      nomImg = 'Loteria-Columna';
      altImg = 'row-icon';
      gameModeTitle = 'FILAS';
      break;
    case 'mode-2':
      id = 2;
      nomImg = 'Loteria-Columna';
      altImg = 'column-icon';
      gameModeTitle = 'COLUMNAS';
      break;
    case 'mode-3':
      id = 3;
      nomImg = 'Loteria-Esquinas';
      altImg = 'corners-icon';
      gameModeTitle = 'ESQUINAS';
      break;
    case 'mode-4':
      id = 4;
      nomImg = 'Loteria-AdentoAfuera';
      altImg = 'inside-icon';
      gameModeTitle = 'ADENTRO O AFUERA';
      break;
    case 'mode-5':
      id = 5;
      nomImg = 'Loteria-Todo';
      altImg = 'all-icon';
      gameModeTitle = 'TODO';

      break;
    default:
      break;
  }

  const HTML = `
  <img
      class="game-mode-icon"
      id="mode-${id}-icon"
      src="/img/icons/${nomImg}.png"
      alt="${altImg}"
  />
  <h3 class="game-mode-title" id="game-mode-${id}-title">${gameModeTitle}<h3>
  `;
  modeDisplay.innerHTML += HTML;
}

// Funcion para poner un frijol en el tablero
function setBeanHuman(e) {
  const box = e.target;
  const currentCardImg = currentCard.querySelector('img');

  if (box.alt === currentCardImg.alt) {
    const bean = document.createElement('IMG');
    bean.src = '/img/icons/Bean.png';
    bean.alt = 'Bean';
    bean.classList.add('bean');
    box.parentNode.classList.add('marked');
    box.insertAdjacentElement('afterend', bean);
  } else if (!box.parentNode.classList.contains('marked')) {
    const alert = document.createElement('div');
    alert.classList.add('block-alert');
    alert.innerHTML = '<h4>CASILLA INCORRECTA</h4>';
    box.insertAdjacentElement('afterend', alert);
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => {
        alert.remove();
      }, 100);
    }, 300);
  }
}

// Funcion de los jugadores controlados por la PC
function setBeanPC(boardPC, playerID) {
  const currentCardImg = currentCard.querySelector('img');
  const boardPCBoxes = document
    .querySelector(`#playerPC${playerID}`)
    .querySelectorAll('.oponent-board-box');

  for (let i = 0; i < 16; i++) {
    if (boardPC[i].nombre === currentCardImg.alt) {
      boardPCBoxes.item(i).style.backgroundColor = '#e64328';
      boardPCBoxes.item(i).classList.add('marked');
    }
  }
}

// Verifica al ganador de los modos filas, columnas y esquinas
function winnerRowColumnCorners(boxes, index, gameMode) {
  let boxesSet;
  let winner;
  for (let j = 1; j <= 4; j++) {
    boxesSet = Array.from(boxes.querySelectorAll(`.${gameMode}-${j}`));
    winner = boxesSet.every((box) => box.classList.contains('marked'));
    console.log(winner);
    if (winner) {
      console.log(index);
      return index !== 0 ? index : 'Humano';
    }
  }
  return false;
}

// Verifica al ganador del modo adentro o afuera
function winnerInsideOutside(boxes, index) {
  let setBoxes;
  let winner;
  setBoxes = Array.from(boxes.querySelectorAll('.inside'));
  winner = setBoxes.every((box) => box.classList.contains('marked'));
  if (winner) {
    return index !== 0 ? index : 'Humano';
  }

  setBoxes = Array.from(boxes.querySelectorAll('.outside'));
  winner = setBoxes.every((box) => box.classList.contains('marked'));
  if (winner) {
    return index !== 0 ? index : 'Humano';
  }
  return false;
}

// Verifica el ganador del modo todas las casillas
function winnerAll(boxes, index) {
  let setBoxes;
  let winner;
  setBoxes = Array.from(boxes.childNodes);
  setBoxes = setBoxes.filter((box) => box.nodeType !== box.TEXT_NODE);
  winner = setBoxes.every((box) => box.classList.contains('marked'));
  if (index === 0) {
    console.log(winner);
  }
  if (winner) {
    return index !== 0 ? index : 'Humano';
  }
  return false;
}

// Asigna la funcion que verifica al ganador dependiendo del modo de juego
function assignWinner() {
  gameMode = gameMode.slice(0, 6);
  switch (gameMode) {
    case 'mode-1':
      modeSet = 'row';
      winnerFunc = winnerRowColumnCorners;
      break;
    case 'mode-2':
      modeSet = 'column';
      winnerFunc = winnerRowColumnCorners;
      break;
    case 'mode-3':
      modeSet = 'corner';
      winnerFunc = winnerRowColumnCorners;
      break;
    case 'mode-4':
      winnerFunc = winnerInsideOutside;
      break;
    case 'mode-5':
      winnerFunc = winnerAll;
      break;
    default:
      break;
  }
}

// Verifica si hay un ganador
function winner() {
  let playerBoardBoxes;
  let winner;
  for (let i = 0; i < 5; i++) {
    playerBoardBoxes = document.querySelector(`#playerPC${i}`);
    winner = winnerFunc(playerBoardBoxes, i, modeSet);
    if (winner) {
      return winner;
    }
  }
  return false;
}

// Limpia todos los tableros
function clearBoards() {
  let playerBoard;
  let setBoxes;
  let bean;
  for (let i = 0; i < 5; i++) {
    playerBoard = document.querySelector(`#playerPC${i}`);
    setBoxes = Array.from(playerBoard.childNodes);
    setBoxes = setBoxes.filter((box) => box.nodeType !== box.TEXT_NODE);
    for (let box of setBoxes) {
      if (box.classList.contains('marked')) {
        box.classList.remove('marked');
        if (box.classList.contains('oponent-board-box')) {
          box.style.backgroundColor = '#fcd188';
        } else {
          bean = box.querySelector('.bean');
          bean.remove();
        }
      }
    }
  }
}

// Muestra al ganador en pantalla
function showWinner(winner) {
  const winnerAlert = document.createElement('div');
  const winnerText = document.createElement('h3');
  const alertButtons = document.createElement('div');
  const volverBtn = document.createElement('a');
  const modoBtn = document.createElement('a');

  winnerAlert.id = 'alert-winner';
  winnerText.id = 'winner-text';
  alertButtons.id = 'alert-buttons';
  volverBtn.classList.add('alert-button');
  modoBtn.classList.add('alert-button');

  winnerText.textContent = `EL JUGADOR ${winner} HA GANADO LA PARTIDA`;
  volverBtn.textContent = 'VOLVER A JUGAR';
  modoBtn.textContent = 'ESCOJER OTRO MODO DE JUEGO';

  winnerAlert.appendChild(winnerText);
  alertButtons.appendChild(volverBtn);
  alertButtons.appendChild(modoBtn);
  winnerAlert.appendChild(alertButtons);
  document.body.appendChild(winnerAlert);

  modoBtn.onclick = function () {
    window.location.href = 'index.html';
  };

  volverBtn.onclick = function () {
    clearBoards();
    winnerAlert.remove();
    initialTimer();
    startGame();
  };
}

// Bucle del juego
function play() {
  let mainDeckIndex = 0;

  const interval = setInterval(() => {
    imgCurrentCard.src = mainDeck[mainDeckIndex].img;
    imgCurrentCard.alt = mainDeck[mainDeckIndex].nombre;

    for (let i = 1; i < 5; i++) {
      setBeanPC(playerBoards[i], i);
    }

    mainDeckIndex++;

    gameOver = winner();
    if (gameOver || mainDeckIndex >= 54) {
      console.log(`El ganador es el jugador ${gameOver}`);
      showWinner(gameOver);
      progressBar.style.animation = 'none';
      clearInterval(interval);
    }
  }, 1000);
}

// function humanWins() {
//   // let countersSets = 0;
//   // console.log(countersSets);
//   const countersSets = [];
//   // console.log(countersSets, mainDeck);
//   const filasIndexes = [
//     [0, 1, 2, 3],
//     [4, 5, 6, 7],
//     [8, 9, 10, 11],
//     [12, 13, 14, 15],
//   ];
//   const columnasIndexes = [
//     [0, 4, 8, 12],
//     [1, 5, 9, 13],
//     [2, 6, 10, 14],
//     [3, 7, 11, 15],
//   ];
//   const esquinasIndexes = [
//     [0, 1, 4, 5],
//     [2, 3, 6, 7],
//     [8, 9, 12, 13],
//     [10, 11, 14, 15],
//   ];
//   let containsCard;

//   let win;

//   let temp = [];
//   for (let playerBoard of playerBoards) {
//     for (let i = 0; i < 4; i++) {
//       for (let box of esquinasIndexes[i]) {
//         for (let j = 0; j < 54; j++) {
//           // console.log(card);
//           if (mainDeck[j].nombre === playerBoard[box].nombre) {
//             temp.push(j);
//           }
//         }
//       }
//     }
//     countersSets.push(temp);
//     temp = [];
//   }

// console.log(countersSets);
//   let reorganizedBoards = [];
//   let reorganizedBoard = [];
//   let rowBoard = [];
//   console.log(reorganizedBoards, countersSets);

//   for (let w = 0; w < 5; w++) {
//     for (let k = 0; k < 4; k++) {
//       for (let box of esquinasIndexes[k]) {
//         rowBoard.push(countersSets[w][box]);
//       }
//       reorganizedBoard.push(rowBoard);
//       rowBoard = [];
//     }
//     reorganizedBoards.push(reorganizedBoard);
//     reorganizedBoard = [];
//   }

//   let maxNumbersBoardsRows = [];
//   let maxNumbersBoardRow = [];
//   for (let board of reorganizedBoards) {
//     for (let x = 0; x < 4; x++) {
//       maxNumbersBoardRow.push(Math.max(...board[x]));
//     }
//     maxNumbersBoardsRows.push(maxNumbersBoardRow);
//     maxNumbersBoardRow = [];
//   }
//   console.log(maxNumbersBoardsRows);

//   const minMaxNumbersBoards = [];
//   for (let maxNumbersList of maxNumbersBoardsRows) {
//     minMaxNumbersBoards.push(Math.min(...maxNumbersList));
//   }
//   console.log(minMaxNumbersBoards);

//   win = minMaxNumbersBoards.indexOf(Math.min(...minMaxNumbersBoards));
//   console.log(`El jugador ${win} ganara la partida`);
// }

// Inicia el juego
function startGame() {
  selectGameMode.then((mode) => {
    console.log(mode);
  });
  gameMode = sessionStorage.getItem('gameMode');

  assignWinner(gameMode);
  showMode(gameMode);
  shuffleCards();
  showCards();
  // humanWins();

  boardBoxes.forEach((boardBox) => {
    boardBox.addEventListener('click', setBeanHuman);
  });

  play();
}

if (document.querySelector('#game-layout')) {
  initialTimer();
  startGame();
}
