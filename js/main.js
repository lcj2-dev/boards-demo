const renderBoardCards = () => {
  const boardsContainer = document.getElementById('boards-wrapper');

  boardsContainer.innerHTML = '';

  // render content
  for (let board of boards) {
    const { name } = board;

    const isActive =
      activeBoardIdx != null ? boards[activeBoardIdx].name == name : false;

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

const renderBoardStaff = () => {
  const staffContainer = document.getElementById('board-staff');

  if (activeBoardIdx == null || !boards[activeBoardIdx].staff.length) {
    staffContainer.innerHTML = `<span>No active staff</span>`;
  } else {
    const { staff } = boards[activeBoardIdx];

    staffContainer.innerHTML = staff
      .map(p => `<div class="board-badge">John Doe</div>`)
      .join('');
  }
};

const renderActiveBoard = () => {
  const boardContainer = document.getElementById('board-wrapper');
  const boardActions = document.getElementById('board-actions');

  if (activeBoardIdx == null) {
    boardContainer.innerHTML = `<span>No board selected</span>`;
    boardActions.classList.add('hidden');
  } else {
    boardContainer.innerHTML = `<span>${boards[activeBoardIdx].name}</span>`;
    boardActions.classList.remove('hidden');
  }

  renderBoardStaff();
};

const selectBoardHandler = ({ currentTarget }) => {
  const boardSlug = currentTarget.dataset.boardName;
  const boardIdx = boards.findIndex(({ name }) => name == boardSlug);
  activeBoardIdx = boardIdx;
  renderBoardCards();
  renderActiveBoard();
};

const closeBoardHandler = () => {
  activeBoardIdx = null;
  renderBoardCards();
  renderActiveBoard();
};

const addPersonHandler = () => {
  const departmentStaff = people.filter(
    p => p.department == boards[activeBoardIdx].name
  );
  const max = departmentStaff.length;

  const person = departmentStaff[Math.floor(Math.random() * max)];

  const boardIdx = boards.findIndex(b => b.name == boards[activeBoardIdx].name);

  boards = [
    ...boards.slice(0, boardIdx),
    { ...boards[boardIdx], staff: [...boards[boardIdx].staff, person] },
    ...boards.slice(boardIdx + 1)
  ];

  activeBoardIdx = boardIdx;

  renderBoardStaff();
};

(() => {
  // render components
  renderBoardCards();
  renderActiveBoard();

  // listen for board events
  document
    .getElementById('close-board')
    .addEventListener('click', closeBoardHandler);

  document
    .getElementById('add-person')
    .addEventListener('click', addPersonHandler);
})();
