const gameboard = document.querySelector('.gameboard');
const currentWord = document.querySelector('.current-word');

const boardLetters = [];
const activeLetters = [];
const excludeCoords = [];
const leadCoords = {};

initiateBoard();

const initialLetters = document.querySelectorAll('.letter');

initialLetters
  .forEach(el => el.addEventListener('click', handleClick));

function initiateBoard() {
  const alphabet = Array
    .from(Array(26))
    .map((_, idx) => String.fromCharCode(idx + 97));

  [...alphabet, '_'].forEach(letter => placeLetter(letter));
  // TO DO: Add backspace ('⌫')
};

function placeLetter(letter) {
  const { row, column } = getRandomCoords();

  const styleAttr = `style="grid-area: ${row} / ${column};"`;

  gameboard.insertAdjacentHTML('beforeend', `
    <span class="initial letter${letter === '_' ? ' space' : ''}" ${styleAttr}>${letter}</span>
  `);

  boardLetters.push(document.querySelector(`[${styleAttr}]`));

  excludeCoords.push(...getSurroundingCoords(row, column), { row, column });
};

function getRandomCoords() {
  const [row, column] = [30, 14]
    .map(max => Math.floor(Math.random() * (max - 2) + 2));

  const excluded = excludeCoords.some(coords => {
    const { row: excludeRow, column: excludeColumn } = coords;
    return ((row === excludeRow) && (column === excludeColumn));
  });

  if (excluded) return getRandomCoords();
  
  return { row, column };
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
    el.removeEventListener('click', handleClick)
  });

  window.addEventListener('keyup', handleKeyUp);
};

function handleKeyUp(e) {
  if (!['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(e.code)) return;

  updateCoords(e.code);

  const newLetter = document
    .querySelector(`[style="grid-area: ${leadCoords.row} / ${leadCoords.column};"]`);
  
  if (newLetter) addNewLetter(newLetter, e.code);

  updateLetterPositions();
};

function updateCoords(code) {
  if (code === 'ArrowUp') leadCoords.row--;
  else if (code === 'ArrowRight') leadCoords.column++;
  else if (code === 'ArrowDown') leadCoords.row++;
  else if (code === 'ArrowLeft') leadCoords.column--;
};

function addNewLetter(newLetter, direction) {
  updateCoords(direction);

  newLetter.classList.add('active');
  activeLetters.push(newLetter);

  if (newLetter.innerHTML === '_') currentWord.innerHTML = '<h3>_</h3>';
  else {
    const newLetterHeading = `<h3>${newLetter.innerHTML}</h3>`;
    if (currentWord.innerHTML.includes('_')) currentWord.innerHTML = newLetterHeading;
    else currentWord.insertAdjacentHTML('beforeend', newLetterHeading);
  }
};

function updateLetterPositions() {
  activeLetters.forEach((letter, idx) => {
    const { gridArea: nextCoords } = (idx !== (activeLetters.length - 1))
      ? activeLetters[idx + 1].style
      : {};

    if (letter.innerHTML === '_') setOrientation(letter, nextCoords);

    if (idx !== (activeLetters.length - 1)) letter.style.gridArea = nextCoords;
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
