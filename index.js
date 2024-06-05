import { words } from './words.js';

const gameboard = document.querySelector('.gameboard');
const rowCount = 30;
const columnCount = 15;
const [centerRow, centerColumn] = [rowCount, columnCount].map(count => Math.ceil(count / 2));
const directionMap = {
  ArrowUp: 'north',
  ArrowRight: 'east',
  ArrowDown: 'south',
  ArrowLeft: 'west'
};

gameboard.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
gameboard.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
gameboard.style.height = `${rowCount * 20}px`;
gameboard.style.width = `${columnCount * 20}px`;

let boardLetters;
let activeLetters;
let availableCoords;
let leadCoords;
let currentWord;
let currentWordHeading;
let inputDirection;
let leadDirection;
let advance = false;
let gameLoop;

initiateBoard();

window.addEventListener('keyup', handleKeyUp);
window.addEventListener('keyup', (e) => e.code === 'Space' ? advance = !advance : null);

function initiateBoard() {
  gameboard.innerHTML = '';

  boardLetters = [];

  activeLetters = [];

  availableCoords = [];

  leadCoords = { row: centerRow, column: centerColumn };

  gameLoop = setInterval(wriggleWord, 250);

  setAvailableCoords();
  
  activateWrig();

  currentWord.substring(3).split('').forEach(letter => placeLetter(letter));

  // showAvailableCoords();
};

function setAvailableCoords() {
  let currentRow = 1;
  
  while (currentRow <= rowCount) {
    let currentColumn = 1;
  
    while (currentColumn <= columnCount) {
      availableCoords.push({ row: currentRow, column: currentColumn });
      currentColumn++;
    }

    currentRow++;
  }
};

function activateWrig() {
  leadDirection = 'east';

  [currentWord] = words.splice(0, 1);
  
  const firstLetters = currentWord.substring(0, 3);
  
  let currentColumn = centerColumn - 2;

  firstLetters.split('').forEach((letter) => {
    const styleAttr = `style="grid-area: ${centerRow} / ${currentColumn};"`;

    gameboard.insertAdjacentHTML('beforeend', `
      <span class="letter ${letter} active" ${styleAttr}>${letter}</span>
    `);

    activeLetters.push(document.querySelector(`[${styleAttr}]`));

    currentColumn++;
  });

  document.querySelector('.current-word').innerHTML = `
    <h3>${firstLetters}${currentWord.substring(3).split('').map(_ => '_').join('')}</h3>
  `;

  currentWordHeading = document.querySelector('.current-word h3');
};

function placeLetter(letter) {
  const randomIdx = Math.floor(Math.random() * (availableCoords.length - 1));
  const [{ row, column }] = availableCoords.splice(randomIdx, 1);
  const styleAttr = `style="grid-area: ${row} / ${column};"`;

  gameboard.insertAdjacentHTML('beforeend', `
    <span class="letter ${letter}" ${styleAttr}">${letter}</span>
  `);

  boardLetters.push(document.querySelector(`[${styleAttr}]`));

  const surroundingCoords = getSurroundingCoords(row, column);

  surroundingCoords.forEach(coords => removeAvailableCoords(coords));
};

function getSurroundingCoords(row, column) {
  return [
    { row: (row - 1), column: (column - 1) },
    { row: (row - 1), column },
    { row: (row - 1), column: (column + 1) },
    { row, column: (column + 1) },
    { row: (row + 1), column: (column + 1) },
    { row: (row + 1), column },
    { row: (row + 1), column: (column - 1) },
    { row, column: (column - 1) }
  ];
};

function removeAvailableCoords(coords) {
  const { row: rowToRemove, column: columnToRemove } = coords;

  const coordsIdx = availableCoords
    .findIndex(({ row, column }) => ((row === rowToRemove) && (column === columnToRemove)));
  
  if (coordsIdx !== -1) availableCoords.splice(coordsIdx, 1);
};

function wriggleWord() {
  if (!advance) return;

  updateLeadDirection();

  updateLeadCoords();

  if (
    leadCoords.row > rowCount ||
    leadCoords.row < 1 ||
    leadCoords.column > columnCount ||
    leadCoords.column < 1
  ) return gameOver();

  const collidingLetter = document
    .querySelector(`[style="grid-area: ${leadCoords.row} / ${leadCoords.column};"]`);
  
  if (collidingLetter) {
    if (collidingLetter.classList.contains('active')) return gameOver();

    addLetterToWrig(collidingLetter);

    if (!currentWordHeading.innerHTML.includes('_')) setNewWord();
  } else updateLetterPositions();

  // showAvailableCoords();
};

function updateLeadDirection() {
  if (
    !inputDirection ||
    (leadDirection === 'north' && inputDirection === 'south') ||
    (leadDirection === 'east' && inputDirection === 'west') ||
    (leadDirection === 'south' && inputDirection === 'north') ||
    (leadDirection === 'west' && inputDirection === 'east')
  ) return;

  leadDirection = inputDirection;
};

function updateLeadCoords() {
  if (leadDirection === 'north') leadCoords.row--;
  else if (leadDirection === 'east') leadCoords.column++;
  else if (leadDirection === 'south') leadCoords.row++;
  else if (leadDirection === 'west') leadCoords.column--;
};

function gameOver() {
  clearInterval(gameLoop);
  console.log('Game Over!');
  // initiateBoard();
};

function addLetterToWrig(letter) {
  letter.classList.add('active');

  const currentWordHeadingText = currentWordHeading.innerText;

  if (currentWordHeadingText.charAt(0) === '_') letter.classList.add('first');

  activeLetters.push(letter);

  currentWordHeading.innerText = currentWordHeadingText.replace('_', letter.innerHTML);
};

function finalizeSegment() {
  const spacer = document.createElement('span');

  spacer.style.gridArea = `${leadCoords.row} / ${leadCoords.column}`;
  spacer.classList.add('letter', 'spacer', 'active');
  spacer.innerHTML = '-';
  
  gameboard.insertAdjacentElement('beforeend', spacer);

  updateLeadCoords();

  activeLetters.push(spacer);
};

function setNewWord() {
  [currentWord] = words.splice(0, 1);
  
  currentWordHeading.innerText = currentWord.split('').map(_ => '_').join('');
  
  currentWord.split('').forEach(letter => placeLetter(letter));
};

function updateLetterPositions() {
  activeLetters.forEach((letter, idx) => {
    const lastIdx = activeLetters.length - 1;
    const { gridArea: nextCoords } = (idx !== lastIdx) ? activeLetters[idx + 1].style : {};

    if (letter.classList.contains('first')) setDirection(letter, nextCoords);

    if (idx !== lastIdx) {
      if (idx === 0) {
        const [row, column] = letter.style.gridArea.split(' / ');
        availableCoords.push({ row, column });
      }

      letter.style.gridArea = nextCoords;
    } else letter.style.gridArea = `${leadCoords.row} / ${leadCoords.column}`;
  });
};

function setDirection(letter, nextCoords) {
  const [currentRow, currentColumn] = letter.style.gridArea
    .split(' / ')
    .map(coord => Number(coord));
    
  const [nextRow, nextColumn] = nextCoords
    ? nextCoords.split(' / ').map(coord => Number(coord))
    : Object.values(leadCoords);
  
  let spacerDirection;

  if (currentRow === nextRow) {
    if (currentColumn < nextColumn) spacerDirection = 'east';
    else spacerDirection = 'west';
  } else {
    if (currentRow < nextRow) spacerDirection = 'south';
    else spacerDirection = 'north';
  }

  letter.setAttribute('data-direction', spacerDirection);
};

function showAvailableCoords() {
  availableCoords.forEach(coords => {
    const { row, column } = coords;
    gameboard.insertAdjacentHTML('beforeend', `
      <div class="available" style="grid-area: ${row} / ${column}"></div>
    `);
  })
};

function handleKeyUp(e) {
  if (
    !['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(e.code) ||
    leadDirection === directionMap[e.code]
  ) return;

  inputDirection = directionMap[e.code];
};
