const renderBoardCards = () => {
  const boardsContainer = document.getElementById('boards-wrapper');

  boardsContainer.innerHTML = '';

  // render content
  for (let board of boards) {
    const { name } = board;

    const isActive = activeBoard ? activeBoard.name == name : false;

    boardsContainer.innerHTML += `
      <div
        class="board-card box ${isActive ? 'active' : ''}"
        data-board-name="${name}"
      >
        <h3>${name}</h3>
      </div>
    `;
  }

  // listen for board selection
  for (let board of document.querySelectorAll(
    '#boards-wrapper > .board-card'
  )) {
    board.addEventListener('click', selectBoardHandler);
  }
};

const renderActiveBoard = () => {
  const boardContainer = document.getElementById('board-wrapper');

  if (!activeBoard) {
    boardContainer.innerHTML = `<span>No board selected</span>`;
  } else {
    boardContainer.innerHTML = `<span>${activeBoard.name}</span>`;
  }
};

const selectBoardHandler = ({ currentTarget }) => {
  const boardSlug = currentTarget.dataset.boardName;
  const board = boards.find(({ name }) => name == boardSlug);
  activeBoard = board;
  renderBoardCards();
  renderActiveBoard();
};

// const

(() => {
  renderBoardCards();
})();
