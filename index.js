const container = document.querySelector('.container');

const leadCoords = {
  row: 2,
  column: 5
};

let lead = document.createElement('span');
lead.innerHTML = 'a';

const { row, column } = leadCoords;
lead.classList.add('letter', 'active');
lead.style.gridArea = `${row}/${column}`;

container.insertAdjacentElement('beforeend', lead);

const letters = [lead];
let direction;

window.addEventListener('keyup', ({ code }) => {
  direction = code.replace('Arrow', '').toLowerCase();

  if (direction === 'up') leadCoords.row--;
  else if (direction === 'right') leadCoords.column++;
  else if (direction === 'down') leadCoords.row++;
  else leadCoords.column--;

  const newCoords = `${leadCoords.row}/${leadCoords.column}`;
  const newLetter = document.querySelector(`[data-coords="${newCoords}"]`);
  
  if (newLetter) {
    if (direction === 'up') leadCoords.row--;
    else if (direction === 'right') leadCoords.column++;
    else if (direction === 'down') leadCoords.row++;
    else leadCoords.column--;

    delete newLetter.dataset.coords;
    newLetter.classList.add('active');
    letters.push(newLetter);
  }

  letters.forEach((letter, idx) => {
    if (idx !== (letters.length - 1)) {
      const { gridArea: nextCoords } = letters[idx + 1].style;
      letter.style.gridArea = nextCoords;
    } else {
      letter.style.gridArea = `${leadCoords.row} / ${leadCoords.column}`;
    }
  });
})
