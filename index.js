const gameboard = document.querySelector('.gameboard');
const currentWord = document.querySelector('.current-word');

const rowCount = 30;
const columnCount = 15;
const minimumWordLength = 3;

gameboard.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;
gameboard.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
gameboard.style.height = `${rowCount * 20}px`;
gameboard.style.width = `${columnCount * 20}px`;

const boardLetters = [];
const activeLetters = [];
const availableCoords = [];
const leadCoords = { row: 1, column: minimumWordLength };

initiateBoard();

window.addEventListener('keyup', handleInitialKeyUp);

function initiateBoard() {
  addSpaces();

  setAvailableCoords();

  const alphabet = Array
    .from(Array(26))
    .map((_, idx) => String.fromCharCode(idx + 97));

  [...alphabet].forEach(letter => placeLetter(letter));

  // showAvailableCoords();
};

function addSpaces() {
  let i = 1;

  while (i <= minimumWordLength) {
    const space = document.createElement('span');

    space.innerHTML = '_';
    space.className = 'letter space active';
    space.style.gridArea = `1 / ${i}`;

    gameboard.insertAdjacentElement('beforeend', space);
    activeLetters.push(space);

    i++;
  }
}

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

// function getRandomLetter() {
//   return
// };

function placeLetter(letter) {
  const randomIdx = Math.floor(Math.random() * (availableCoords.length - 1));
  const [{ row, column }] = availableCoords.splice(randomIdx, 1);
  
  const styleAttr = `style="grid-area: ${row} / ${column};"`;

  gameboard.insertAdjacentHTML('beforeend', `
    <span class="letter${letter === '_' ? ' space' : ''}" ${styleAttr}>${letter}</span>
  `);

  boardLetters.push(document.querySelector(`[${styleAttr}]`));

  [...getSurroundingCoords(row, column)]
    .forEach(({ row: unavailableRow, column: unavailableColumn }) => {
      const coordsIdx = availableCoords
        .findIndex(({ row: availableRow, column: availableColumn }) => (
          (availableRow === unavailableRow && availableColumn === unavailableColumn)
        ))
        
      if (coordsIdx !== -1) availableCoords.splice(coordsIdx, 1);
    })
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

function handleInitialKeyUp() {
  window.removeEventListener('keyup', handleInitialKeyUp);
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
    const lastIdx = activeLetters.length - 1;

    const { gridArea: nextCoords } = (idx !== lastIdx) ? activeLetters[idx + 1].style : {};

    if (letter.innerHTML === '_') setOrientation(letter, nextCoords);

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

function setOrientation(letter, nextCoords) {
  const [currentRow] = letter.style.gridArea.split(' / ');
  const [nextRow] = nextCoords
    ? nextCoords.split(' / ')
    : Object.values(leadCoords).map(coord => coord.toString());
  
  const orientation = (currentRow === nextRow) ? 'horizontal' : 'vertical';
  letter.setAttribute('data-orientation', orientation);
};

function showAvailableCoords() {
  availableCoords.forEach(coords => {
    const { row, column } = coords;
    gameboard.insertAdjacentHTML('beforeend', `
      <div class="available" style="grid-area: ${row} / ${column}"></div>
    `);
  })
};
