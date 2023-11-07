import { words } from './words.js';

const gameboard = document.querySelector('.gameboard');
const currentWord = document.querySelector('.current-word');

const rowCount = 30;
const columnCount = 15;
const [centerRow, centerColumn] = [rowCount, columnCount]
  .map(count => Math.ceil(count / 2));

gameboard.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
gameboard.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
gameboard.style.height = `${rowCount * 20}px`;
gameboard.style.width = `${columnCount * 20}px`;

const boardLetters = [];
const activeLetters = [];
const availableCoords = [];
const leadCoords = {
  row: centerRow,
  column: centerColumn
};

initiateBoard();

window.addEventListener('keyup', handleKeyUp);

function initiateBoard() {
  setAvailableCoords();
  placeAlphabet();
  activateLead();

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

function placeAlphabet() {
  const alphabet = Array
    .from(Array(26))
    .map((_, idx) => String.fromCharCode(idx + 97));

  [/* ...alphabet,  */'_', '_', '_', '_'].forEach(letter => placeLetter(letter));
};

function placeLetter(letter) {
  const randomIdx = Math.floor(Math.random() * (availableCoords.length - 1));
  const [{ row, column }] = availableCoords.splice(randomIdx, 1);

  const styleAttr = `style="grid-area: ${row} / ${column};"`;

  gameboard.insertAdjacentHTML('beforeend', `
    <span class="letter ${letter}${letter === '_' ? ' space' : ''}" ${styleAttr}>${letter}</span>
  `);

  boardLetters.push(document.querySelector(`[${styleAttr}]`));

  const surroundingCoords = getSurroundingCoords(row, column);
  surroundingCoords.forEach(coords => removeAvailableCoords(coords));
};

function removeAvailableCoords(coords) {
  const { row: rowToRemove, column: columnToRemove } = coords;

  const coordsIdx = availableCoords
    .findIndex(({ row, column }) => ((row === rowToRemove) && (column === columnToRemove)));
  
  if (coordsIdx !== -1) availableCoords.splice(coordsIdx, 1);
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

function activateLead() {
  const [word] = words.splice(0);
  const leadLetter = word.charAt(0);
  const lead = document.querySelector(`.${leadLetter}`);
  
  lead.classList.add('active');
  activeLetters.push(lead);
  currentWord.innerHTML = `<h3>${lead.innerHTML}</h3`;

  const [row, column] = lead.style.gridArea.split(' / ');
  leadCoords.row = Number(row);
  leadCoords.column = Number(column);
};

function handleClick(e) {
  const { target: letter } = e;
  letter.classList.add('active');
  activeLetters.push(letter);
  currentWord.innerHTML = `<h3>${letter.innerHTML}</h3`;

  const [row, column] = letter.style.gridArea.split(' / ');
  leadCoords.row = Number(row);
  leadCoords.column = Number(column);

  initialLetters.forEach(el => {
    el.classList.remove('initial');
    el.removeEventListener('click', handleClick);
  });

  placeLetter(letter.innerHTML);

  window.addEventListener('keyup', handleKeyUp);
};

function handleKeyUp(e) {
  if (!['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(e.code)) return;

  updateCoords(e.code);

  const newLetter = document
    .querySelector(`[style="grid-area: ${leadCoords.row} / ${leadCoords.column};"]`);
  
  if (newLetter) {
    addNewLetter(newLetter, e.code);
    placeLetter(newLetter.innerHTML);
  }

  updateLetterPositions();

  // showAvailableCoords();
};

function updateCoords(code) {
  if (code === 'ArrowUp') leadCoords.row--;
  else if (code === 'ArrowRight') leadCoords.column++;
  else if (code === 'ArrowDown') leadCoords.row++;
  else if (code === 'ArrowLeft') leadCoords.column--;
};

function addNewLetter(letter, direction) {
  updateCoords(direction);

  letter.classList.add('active');
  activeLetters.push(letter);

  if (letter.innerHTML === '_') currentWord.innerHTML = '<h3>_</h3>';
  else {
    const newLetterHeading = `<h3>${letter.innerHTML}</h3>`;
    if (currentWord.innerHTML.includes('_')) currentWord.innerHTML = newLetterHeading;
    else currentWord.insertAdjacentHTML('beforeend', newLetterHeading);
  }
};

function updateLetterPositions() {
  activeLetters.forEach((letter, idx) => {
    console.log('activeLetters: ', activeLetters);
    if (letter.classList.contains('space')) transformSpace(letter, idx);

    const lastIdx = activeLetters.length - 1;

    const { gridArea: nextCoords } = (idx !== lastIdx) ? activeLetters[idx + 1].style : {};

    if (letter.innerHTML === '_') setDirection(letter, nextCoords);

    if (idx !== lastIdx) {
      if (idx === 0) {
        const [row, column] = letter.style.gridArea.split(' / ');
        availableCoords.push({ row, column });
      }
      letter.style.gridArea = nextCoords;
    }
    else letter.style.gridArea = `${leadCoords.row} / ${leadCoords.column}`;
  });
};

function setDirection(letter, nextCoords) {
  const [currentRow, currentColumn] = letter.style.gridArea.split(' / ');
  const [nextRow, nextColumn] = nextCoords
    ? nextCoords.split(' / ')
    : Object.values(leadCoords).map(coord => coord.toString());
  
  let direction;

  if (currentRow === nextRow) {
    if (currentColumn < nextColumn) direction = 'east';
    else direction = 'west';
  } else {
    if (currentRow < nextRow) direction = 'south';
    else direction = 'north';
  }

  letter.setAttribute('data-direction', direction);
};

function transformSpace(letter, idx) {
  const { direction: currentDirection } = letter.dataset;
  const { direction: previousDirection } = activateLead[idx + 1].dataset || {};
  console.log({ currentDirection, previousDirection });
};

function showAvailableCoords() {
  availableCoords.forEach(coords => {
    const { row, column } = coords;
    gameboard.insertAdjacentHTML('beforeend', `
      <div class="available" style="grid-area: ${row} / ${column}"></div>
    `);
  })
};
