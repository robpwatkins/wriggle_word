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

let activeLetters;
let availableCoords;
let leadCoords;
let currentWord;
let currentLetterIdx;
let currentSegmentIdx = 0;
let currentWordHeading;
let currentSegmentComplete = false;
let inputDirection;
let leadDirection;
let advance = false;
let gameLoop;

const segments = [];

initiateBoard();

window.addEventListener('keyup', handleKeyUp);
window.addEventListener('keyup', (e) => e.code === 'Space' ? advance = !advance : null);

function initiateBoard() {
  gameboard.innerHTML = '';

  // activeLetters = [];

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
  const firstSegment = [];
  
  let currentColumn = centerColumn - 2;

  firstLetters.split('').forEach((letter) => {
    const styleAttr = `style="grid-area: ${centerRow} / ${currentColumn};"`;

    gameboard.insertAdjacentHTML('beforeend', `
      <span class="letter ${letter} active" ${styleAttr}>${letter}</span>
    `);

    firstSegment.push(document.querySelector(`[${styleAttr}]`));

    currentColumn++;
  });

  segments.push(firstSegment);

  document.querySelector('.current-word').innerHTML = `
    <h3>${firstLetters}${currentWord.substring(3).split('').map(_ => '_').join('')}</h3>
  `;

  currentLetterIdx = 3;

  currentWordHeading = document.querySelector('.current-word h3');
};

function placeLetter(letter) {
  const randomIdx = Math.floor(Math.random() * (availableCoords.length - 1));
  const [{ row, column }] = availableCoords.splice(randomIdx, 1);

  gameboard.insertAdjacentHTML('beforeend', `
    <span class="letter ${letter}" style="grid-area: ${row} / ${column};">${letter}</span>
  `);

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

    if (currentSegmentComplete) {
      collidingLetter.classList.add('first');

      segments.push([]);

      currentSegmentIdx++;
      
      currentSegmentComplete = false;
    }

    if (collidingLetter.innerText === currentWord.charAt(currentLetterIdx)) {
      handleValidLetterCollision(collidingLetter);
    } else handleInvalidLetterCollision(collidingLetter);
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

function handleValidLetterCollision(letter) {
  letter.classList.add('active');

  const currentWordHeadingText = currentWordHeading.innerText;

  segments[currentSegmentIdx].push(letter);

  currentWordHeading.innerText = currentWordHeadingText.replace('_', letter.innerText);
  
  if (currentLetterIdx === currentWord.length - 1) setNewWord();
  else currentLetterIdx++;
};

function handleInvalidLetterCollision(letter) {
  letter.classList.add('active', 'invalid');

  const currentSegment = segments[currentSegmentIdx];
  const currentLead = currentSegment[currentSegment.length - 1];

  if (!currentLead.classList.contains('invalid')) {
    const lastInvalidIdx = currentSegment
      .findLastIndex(letter => letter.classList.contains('invalid'));
    
    if (lastInvalidIdx === -1) {
      const [firstLetter] = currentSegment;
      const { gridArea: firstCoords } = firstLetter.style;
      const { gridArea: letterCoords } = letter.style;

      currentLead.style.gridArea = letterCoords;

      letter.style.gridArea = firstCoords;
      letter.classList.add('first');

      setDirection(letter, currentSegment[1].style.gridArea);

      firstLetter.classList.remove('first');

      currentSegment.unshift(letter);
    }
  } else currentSegment.push(letter);

  placeLetter(letter.innerText);
};

function setNewWord() {
  [currentWord] = words.splice(0, 1);
  
  currentWordHeading.innerText = currentWord.split('').map(_ => '_').join('');
  
  currentWord.split('').forEach(letter => placeLetter(letter));

  currentLetterIdx = 0;

  currentSegmentComplete = true;
};

function updateLetterPositions() {
  const lastSegmentIdx = segments[currentSegmentIdx].length
    ? currentSegmentIdx
    : currentSegmentIdx - 1;

  segments.forEach((segment, segmentIdx) => {
    segment.forEach((letter, letterIdx) => {
      const nextLetter = (letterIdx === segment.length - 1 && segmentIdx !== lastSegmentIdx)
        ? segments[segmentIdx + 1][0]
        : segment[letterIdx + 1];
      const { gridArea: nextCoords } = nextLetter ? nextLetter.style : {};
  
      if (letter.classList.contains('first')) setDirection(letter, nextCoords);
  
      if (!nextLetter) letter.style.gridArea = `${leadCoords.row} / ${leadCoords.column}`;
      else {
        if (segmentIdx === 0 && letterIdx === 0) {
          const [row, column] = letter.style.gridArea.split(' / ');
          
          availableCoords.push({ row, column });
        }
  
        letter.style.gridArea = nextCoords;
      }
    });
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
