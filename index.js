const container = document.querySelector('.container');

// const body = '';

const position = {
  row: 2,
  column: 5
};

const worm = document.createElement('div');
worm.style.display = 'flex';
worm.innerHTML = '<span>a</span>';

const { row, column } = position;
worm.style.fontWeight = 'bold';
worm.style.gridArea = `${row}/${column}`;

container.insertAdjacentElement('afterbegin', worm);

window.addEventListener('keyup', (e) => {
  const { code } = e;

  if (code === 'ArrowUp') position.row--;
  else if (code === 'ArrowRight') position.column++;
  else if (code === 'ArrowDown') position.row++;
  else position.column--;

  const newCoords = `${position.row}/${position.column}`;

  const letter = document.querySelector(`[data-coords="${newCoords}"]`);
  
  if (letter) {
    letter.remove();
    worm.insertAdjacentElement('beforeend', letter);
  }

  worm.style.gridArea = newCoords;
})
