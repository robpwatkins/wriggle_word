const container = document.querySelector('.container');

const leadCoords = {
  row: 2,
  column: 5
};

const lead = document.createElement('span');
lead.innerHTML = 'a';

const { row, column } = leadCoords;
lead.classList.add('letter', 'active');
lead.style.gridArea = `${row}/${column}`;

container.insertAdjacentElement('beforeend', lead);

const letters = [lead];

window.addEventListener('keyup', ({ code }) => {
  if (code === 'ArrowUp') leadCoords.row--;
  else if (code === 'ArrowRight') leadCoords.column++;
  else if (code === 'ArrowDown') leadCoords.row++;
  else leadCoords.column--;

  const newCoords = `${leadCoords.row}/${leadCoords.column}`;

  const newLetter = document.querySelector(`[data-coords="${newCoords}"]`);
  
  if (newLetter) {
    letters.unshift(newLetter);
    leadCoords.column++;

    letters.forEach((letter, idx) => {
      if (idx !== 0) {
        const { gridArea: nextCoords } = letters[idx - 1].style;
        letter.style.gridArea = nextCoords;
      } else letter.style.gridArea = `${leadCoords.row}/${leadCoords.column}`;
    });
  }

  lead.style.gridArea = newCoords;
})
