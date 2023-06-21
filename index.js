const gameboard = document.querySelector('.gameboard');
const initialLetters = document.querySelectorAll('.letter');
const currentWord = document.querySelector('.current-word');

initiateBoard();

const letters = [];
const leadCoords = {};

initialLetters
  .forEach(el => el.addEventListener('click', handleClick));

function initiateBoard() {
  const alphabet = getAlphabet();
  alphabet.forEach((letter, idx) => generateLetter(letter, idx));
};

function generateLetter(letter, idx) {
  const row = getRandomNumber(10);
  const column = getRandomNumber(21);

  if (idx !== 0) {

  }

  gameboard.insertAdjacentHTML('beforeend', `
    <span
      class="initial letter"
      style="grid-area: ${getRandomNumber(21)} / ${getRandomNumber(10)};"
    >
        ${letter}
    </span>
  `);
};

function getRandomNumber(max, min = 0) {
  return Math.floor(Math.random() * (max - min) + min);
};

function getAlphabet() {
  const alphabet = [];
  for (let i = 'a'.charCodeAt(0); i <= 'z'.charCodeAt(0); i++) {
    alphabet.push(String.fromCharCode(i));
  }

  return alphabet;
};

function handleClick(e) {
  const { target: letter } = e;
  letter.classList.add('active');
  letters.push(letter);
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
  letters.push(newLetter);

  if (newLetter.innerHTML === '_') currentWord.innerHTML = '<h3>_</h3>';
  else {
    const newLetterHeading = `<h3>${newLetter.innerHTML}</h3>`;
    if (currentWord.innerHTML.includes('_')) currentWord.innerHTML = newLetterHeading;
    else currentWord.insertAdjacentHTML('beforeend', newLetterHeading);
  }
};

function updateLetterPositions() {
  letters.forEach((letter, idx) => {
    const { gridArea: nextCoords } = (idx !== (letters.length - 1))
      ? letters[idx + 1].style
      : {};

    if (letter.innerHTML === '_') setOrientation(letter, nextCoords);

    if (idx !== (letters.length - 1)) letter.style.gridArea = nextCoords;
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
