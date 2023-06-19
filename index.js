const gameboard = document.querySelector('.gameboard');
const currentWord = document.querySelector('.current-word');

const leadCoords = {
  row: 10,
  column: 6
};

let lead = document.createElement('span');
lead.innerHTML = 'y';

const { row, column } = leadCoords;
lead.classList.add('letter', 'active');
lead.style.gridArea = `${row}/${column}`;

gameboard.insertAdjacentElement('beforeend', lead);

const letters = [lead];
let direction;

window.addEventListener('keyup', ({ code }) => {
  direction = code.replace('Arrow', '').toLowerCase();

  if (direction === 'up') leadCoords.row--;
  else if (direction === 'right') leadCoords.column++;
  else if (direction === 'down') leadCoords.row++;
  else leadCoords.column--;

  const newCoords = `${leadCoords.row} / ${leadCoords.column}`;
  const newLetter = document.querySelector(`[style="grid-area: ${newCoords};"]`);
  
  if (newLetter) {
    if (direction === 'up') leadCoords.row--;
    else if (direction === 'right') leadCoords.column++;
    else if (direction === 'down') leadCoords.row++;
    else leadCoords.column--;

    newLetter.classList.add('active');
    letters.push(newLetter);

    if (newLetter.innerHTML === '_') currentWord.innerHTML = '<h3>_</h3>';
    else {
      const newLetterHeading = `<h3>${newLetter.innerHTML}</h3>`;
      if (currentWord.innerHTML.includes('_')) currentWord.innerHTML = newLetterHeading;
      else currentWord.insertAdjacentHTML('beforeend', newLetterHeading);
    }
  }

  letters.forEach((letter, idx) => {
    if (idx !== (letters.length - 1)) {
      const { gridArea: nextCoords } = letters[idx + 1].style;
      letter.style.gridArea = nextCoords;
    } else letter.style.gridArea = `${leadCoords.row} / ${leadCoords.column}`;
  });
})
