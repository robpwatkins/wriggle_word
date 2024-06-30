import { words } from './words.js';

const gameboard = document.querySelector('.gameboard');
const successesHeading = document.querySelector('.successes');
const rowCount = 30;
const columnCount = 15;
const [centerRow, centerColumn] = [rowCount, columnCount].map(count => Math.ceil(count / 2));
const directionMap = {
  ArrowUp: 'north',
  ArrowRight: 'east',
  ArrowDown: 'south',
  ArrowLeft: 'west'
};

gameboard.style.height = `${rowCount * 20}px`;
gameboard.style.width = `${columnCount * 20}px`;
gameboard.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
gameboard.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;

const wordLengthPattern = [4, 4, 5, 4, 5, 6, 5, 4, 5, 6, 7, 6, 5, 4, 5, 6, 7, 8];
const segments = [];

let wordLengthIdx = 0;
let availableCoords;
let leadCoords;
let currentWord;
let newWord = false;
let currentLetterIdx;
let currentSegmentIdx = 0;
let inputDirection;
let leadDirection;
let advance = false;
let gameLoop;

initiateBoard();

window.addEventListener('keyup', handleKeyUp);
window.addEventListener('keyup', (e) => e.code === 'Space' ? advance = !advance : null);

function initiateBoard() {
  gameboard.innerHTML = '';

  availableCoords = [];

  leadCoords = { row: centerRow, column: centerColumn };

  setAvailableCoords();

  activateWrig();

  currentWord.substring(3).split('').forEach(letter => placeLetter(letter));

  gameLoop = setInterval(wriggleWord, 150);
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

  const currentLengthWords = words.filter(w => w.length === wordLengthPattern[0]);

  [currentWord] = currentLengthWords.splice(getRandomIdx(currentLengthWords.length), 1);

  const firstLetters = currentWord.substring(0, 3);
  const firstSegment = [];

  let currentColumn = centerColumn - 2;

  firstLetters.split('').forEach((letter, idx) => {
    let positionClassStr = '';
    
    if (idx === 0) positionClassStr = ' rear segment-rear';
    else if (idx === 2) positionClassStr = ' lead';
    
    const styleAttr = `style="grid-area: ${centerRow} / ${currentColumn};"`;

    gameboard.insertAdjacentHTML('beforeend', `
      <span class="letter ${letter} active${positionClassStr}" ${styleAttr}>${letter}</span>
    `);

    firstSegment.push(document.querySelector(`[${styleAttr}]`));

    removeAvailableCoords({ row: centerRow, column: currentColumn });

    currentColumn++;
  });

  segments.push(firstSegment);

  const remainingSpaces = currentWord.substring(3).split('').map(_ => '_').join('');

  successesHeading.innerText = `${firstLetters}${remainingSpaces}`;

  currentLetterIdx = 3;
};

function getRandomIdx(max) {
  return Math.floor(Math.random() * max);
};

function placeLetter(letter, invalid) {
  const randomIdx = getRandomIdx(availableCoords.length);
  const { row, column } = availableCoords[randomIdx];

  removeAvailableCoords({ row, column });
  
  gameboard.insertAdjacentHTML('beforeend', `
    <span class="letter ${letter}" style="grid-area: ${row} / ${column};">${letter}</span>
  `);

  if (invalid) {
    document.querySelectorAll(`.${letter}:not(.active)`)
      .forEach(letter => letter.classList.add('invalid'));
  }
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

  if (leadCoords.row > rowCount) leadCoords.row = 1;
  else if (leadCoords.row < 1) leadCoords.row = rowCount;
  else if (leadCoords.column > columnCount) leadCoords.column = 1;
  else if (leadCoords.column < 1) leadCoords.column = columnCount;

  const collidingLetter = document
    .querySelector(`[style="grid-area: ${leadCoords.row} / ${leadCoords.column};"]`);

  if (collidingLetter && !collidingLetter.classList.contains('rear')) {
    if (collidingLetter.classList.contains('active')) return gameOver();
    else if (collidingLetter.classList.contains('invalid')) return updateLetterPositions();

    collidingLetter.classList.add('active', 'lead');
    collidingLetter.previousElementSibling.classList.remove('lead');

    if (newWord) {
      collidingLetter.classList.add('segment-rear');

      setDirection(collidingLetter);

      segments.push([collidingLetter]);

      currentSegmentIdx++;

      newWord = false;
    } else segments[currentSegmentIdx].push(collidingLetter);

    if (collidingLetter.innerText === currentWord[currentLetterIdx]) {
      handleValidLetterCollision(collidingLetter);
    } else handleInvalidLetterCollision(collidingLetter);
  } else updateLetterPositions();
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

  const { row: leadRow, column: leadColumn } = leadCoords;

  removeAvailableCoords({ row: leadRow, column: leadColumn });
};

function gameOver() {
  clearInterval(gameLoop);
  console.log('Game Over!');
  // initiateBoard();
};

function updateLetterPositions() {
  segments.forEach((segment, segmentIdx) => {
    const lastLetterIdx = segment.length - 1;

    segment.forEach((letter, letterIdx) => {
      const nextLetter = (letterIdx === lastLetterIdx && segmentIdx !== currentSegmentIdx)
        ? segments[segmentIdx + 1][0]
        : segment[letterIdx + 1];
      const { gridArea: nextCoords } = nextLetter ? nextLetter.style : {};

      if (letter.classList.contains('segment-rear') && !letter.classList.contains('rear')) {
        setDirection(letter, nextCoords);
      }

      if (!nextLetter) letter.style.gridArea = `${leadCoords.row} / ${leadCoords.column}`;
      else {
        if (segmentIdx === 0 && letterIdx === 0) {
          const [rowToAdd, columnToAdd] = letter.style.gridArea.split(' / ')
            .map(coord => Number(coord));

          availableCoords.push({ row: rowToAdd, column: columnToAdd });
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

  let dividerDirection;

  if (currentRow === nextRow) {
    if (currentColumn === nextColumn) dividerDirection = leadDirection;
    else if (currentColumn < nextColumn) dividerDirection = 'east';
    else dividerDirection = 'west';
  } else {
    if (currentRow < nextRow) dividerDirection = 'south';
    else dividerDirection = 'north';
  }

  letter.setAttribute('data-direction', dividerDirection);
};

function handleValidLetterCollision(letter) {
  successesHeading.innerText = successesHeading.innerText.replace('_', letter.innerText);

  if (currentLetterIdx !== 0) {
    const leadSegment = segments[currentSegmentIdx];
    const invalidLetters = leadSegment.filter(letter => (
      letter.classList.contains('invalid') &&
      letter.dataset.idx === currentLetterIdx.toString()
    ));

    if (invalidLetters.length) {
      const firstValidIdx = leadSegment
        .findIndex(letter => !letter.classList.contains('invalid'));
      const coords = leadSegment.slice(firstValidIdx).map(letter => letter.style.gridArea);
      const validLetters = leadSegment.splice(
        firstValidIdx,
        (leadSegment.filter(letter => !letter.classList.contains('invalid'))).length - 1
      );

      validLetters.forEach(letter => leadSegment.splice(leadSegment.length - 1, 0, letter));

      coords.forEach((coord, idx) => leadSegment[idx + firstValidIdx].style.gridArea = coord);

      const [rearmostLetter] = leadSegment;

      if (!rearmostLetter.classList.contains('segment-rear')) {
        leadSegment
          .find(
            letter => letter.classList.contains('segment-rear')
          ).classList.remove('segment-rear');

        rearmostLetter.classList.add('segment-rear');

        setDirection(rearmostLetter, leadSegment[1].style.gridArea);
      }
    }
  }

  if (currentLetterIdx === currentWord.length - 1) setNewWord();
  else {
    const invalidBoardLetters = document.querySelectorAll('.invalid:not(.active)');
  
    if (invalidBoardLetters.length) {
  
      invalidBoardLetters.forEach(letter => letter.classList.remove('invalid'));
    }
  
    currentLetterIdx++;
  }
};

function handleInvalidLetterCollision(letter) {
  letter.classList.add('active', 'invalid');
  letter.setAttribute('data-idx', `${currentLetterIdx}`);

  placeLetter(letter.innerText, true);
};

function setNewWord() {
  wordLengthIdx++;

  const currentLengthWords = words.filter(w => w.length === wordLengthPattern[wordLengthIdx]);

  [currentWord] = currentLengthWords.splice(getRandomIdx(currentLengthWords.length), 1);

  successesHeading.innerText = currentWord.split('').map(_ => '_').join('');

  currentWord.split('').forEach(letter => placeLetter(letter));

  currentLetterIdx = 0;

  newWord = true;
};

function handleKeyUp(e) {
  if (
    !['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(e.code) ||
    leadDirection === directionMap[e.code]
  ) return;

  inputDirection = directionMap[e.code];
};
