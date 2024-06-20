import { permutations } from './permutations.js';
// import { permutations } from './permutationsDev.js';

const words = permutations
  .filter(permArr => permArr[0].word.length === 5)
  .map(permArr => permArr.filter(perm => perm.corpus_count > 4500).map(perm => perm.word));
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

let availableCoords;
let leadCoords;
let currentWordsIdx;
let currentWords;
let currentLetters;
let currentWordHeading;
let newWord = false;
let currentLetterIdx;
let currentSegmentIdx = 0;
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

  availableCoords = [];

  leadCoords = { row: centerRow, column: centerColumn };

  setAvailableCoords();
  
  activateWrig();

  currentLetters.substring(3).split('').forEach(letter => placeLetter(letter));

  gameLoop = setInterval(wriggleWord, 175);

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

  currentWordsIdx = getRandomIdx(words.length);

  currentWords = words[currentWordsIdx];

  [currentLetters] = currentWords;

  const firstLetters = currentLetters.substring(0, 3);
  const firstSegment = [];
  
  let currentColumn = centerColumn - 2;

  firstLetters.split('').forEach((letter, idx) => {
    const styleAttr = `style="grid-area: ${centerRow} / ${currentColumn};"`;

    gameboard.insertAdjacentHTML('beforeend', `
      <span class="letter ${letter} active ${idx === 2 ? 'lead' : ''}" ${styleAttr}>${letter}</span>
    `);

    firstSegment.push(document.querySelector(`[${styleAttr}]`));

    removeAvailableCoords({ row: centerRow, column: currentColumn });

    currentColumn++;
  });

  segments.push(firstSegment);

  document.querySelector('.metadata').innerHTML = `
    <h3>${firstLetters}${currentLetters.substring(3).split('').map(_ => '_').join('')}</h3>
  `;

  currentLetterIdx = 3;

  currentWordHeading = document.querySelector('.metadata h3');
};

function getRandomIdx(max) {
  return Math.floor(Math.random() * max);
};

function placeLetter(letter) {
  const randomIdx = getRandomIdx(availableCoords.length - 1);
  const { row, column } = availableCoords[randomIdx];

  gameboard.insertAdjacentHTML('beforeend', `
    <span class="letter ${letter}" style="grid-area: ${row} / ${column};">${letter}</span>
  `);

  removeAvailableCoords({ row, column });
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

  if (leadCoords.row > rowCount) leadCoords.row = 1;
  else if (leadCoords.row < 1) leadCoords.row = rowCount;
  else if (leadCoords.column > columnCount) leadCoords.column = 1;
  else if (leadCoords.column < 1) leadCoords.column = columnCount;

  const collidingLetter = document
    .querySelector(`[style="grid-area: ${leadCoords.row} / ${leadCoords.column};"]`);
  
  if (collidingLetter) {
    if (collidingLetter.classList.contains('active')) return gameOver();

    collidingLetter.classList.add('active', 'lead');

    if (newWord) {
      collidingLetter.classList.add('first');

      segments.push([collidingLetter]);

      currentSegmentIdx++;
      
      newWord = false;
    } else segments[currentSegmentIdx].push(collidingLetter);

    const filteredPermutations = currentWords
      .filter(perm => perm[currentLetterIdx] === collidingLetter.innerText);

      if (filteredPermutations.length) {
      currentWords = filteredPermutations;

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
  
  const { row: leadRow, column: leadColumn } = leadCoords;

  removeAvailableCoords({ row: leadRow, column: leadColumn });
};

function gameOver() {
  clearInterval(gameLoop);
  console.log('Game Over!');
  // initiateBoard();
};

function handleValidLetterCollision(letter) {
  const currentWordHeadingText = currentWordHeading.innerText;

  currentWordHeading.innerText = currentWordHeadingText.replace('_', letter.innerText);
  
  if (currentLetterIdx === currentLetters.length - 1) {
    const origWords = words[currentWordsIdx];
    const completedWord = segments[currentSegmentIdx]
      .filter(el => !el.classList.contains('invalid'))
      .map(el => el.innerText).join('');
    
    words[currentWordsIdx] = origWords.filter(word => word !== completedWord);

    setNewWords();
  } else currentLetterIdx++;
};

function handleInvalidLetterCollision(letter) {
  letter.classList.add('active', 'invalid');

  const leadSegment = segments[currentSegmentIdx];

  if (leadSegment.length > 1) {
    const lead = leadSegment.pop();
    const lastInvalidIdx = leadSegment
      .findLastIndex(letter => letter.classList.contains('invalid'));
    const targetLetter = lastInvalidIdx === -1 ? leadSegment[0] : leadSegment[lastInvalidIdx];
    const { gridArea: targetCoords } = targetLetter.style;
    const { gridArea: leadCoords } = lead.style;
  
    lead.classList.remove('lead');
  
    if (lastInvalidIdx === -1) {
      targetLetter.classList.remove('first');
  
      lead.classList.add('first');
  
      leadSegment.unshift(lead);
    } else leadSegment.splice(lastInvalidIdx + 1, 0, lead);
  
    for (let i = (lastInvalidIdx === -1 ? 0 : lastInvalidIdx); i < leadSegment.length; i++) {
      const letter = leadSegment[i];
  
      if (i === lastInvalidIdx) letter.style.gridArea = targetCoords;
      else if (i === leadSegment.length - 1) {
        letter.classList.add('lead');
        letter.style.gridArea = leadCoords;
      } else {
        const { gridArea: nextCoords } = leadSegment[i + 1].style;
  
        letter.style.gridArea = nextCoords;
      }
    }
  }

  placeLetter(letter.innerText);
};

function setNewWords() {
  currentWordsIdx = getRandomIdx(words.length);

  currentWords = words[currentWordsIdx];

  [currentLetters] = currentWords;
  
  currentWordHeading.innerText = currentLetters.split('').map(_ => '_').join('');
  
  currentLetters.split('').forEach(letter => placeLetter(letter));

  currentLetterIdx = 0;

  newWord = true;
};

function updateLetterPositions() {
  segments.forEach((segment, segmentIdx) => {
    const lastLetterIdx = segment.length - 1;

    segment.forEach((letter, letterIdx) => {
      const nextLetter = (letterIdx === lastLetterIdx && segmentIdx !== currentSegmentIdx)
        ? segments[segmentIdx + 1][0]
        : segment[letterIdx + 1];
      const { gridArea: nextCoords } = nextLetter ? nextLetter.style : {};
  
      if (letter.classList.contains('first')) setDirection(letter, nextCoords);
  
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
