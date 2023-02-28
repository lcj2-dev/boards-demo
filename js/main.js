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
  const staffContainer = document.getElementById('staff-board-content');
  const staffHeader = document.getElementById('staff-board-header');

  if (activeBoardIdx == null || !boards[activeBoardIdx].staff.length) {
    staffHeader.textContent = 'No active staff';
    staffContainer.innerHTML = '';
  } else {
    const { staff } = boards[activeBoardIdx];

    staffHeader.textContent = 'Active staff';

    staffContainer.innerHTML = staff
      .map(
        ({ name, surname, department, id }) => `
          <div class="board-badge" data-id="${id}">
            <span>${name} ${surname}</span>
            <span>${department}</span>
          </div>
        `
      )
      .join('');

    // listen for badge events
    for (let badge of staffContainer.querySelectorAll('.board-badge')) {
      badge.addEventListener('click', ({ currentTarget }) => {
        activePersonId = parseInt(currentTarget.dataset.id);
        currentTarget.classList.add('active');
      });
    }
  }
};

const renderActiveBoard = () => {
  const boardWrapper = document.getElementById('active-board-wrapper');
  // const boardContainer = document.getElementById('main-board-content');

  if (activeBoardIdx == null) {
    boardWrapper.innerHTML = '';
  } else {
    const { name, support } = boards[activeBoardIdx];

    // render boards
    boardWrapper.innerHTML = `
      <h2 class="headline">Active Board</h2>
      <div class="board-actions box">
        <button class="btn btn-danger" id="close-board">Close board</button>
        <button class="btn btn-success" id="add-person">Add person</button>
      </div>
      <div class="active-board-wrapper">
        <div class="board-main box">
          <h4>${name}</h4>
          <div id="main-board-content" data-cell-slug="${name}-main"></div>
        </div>
        <div class="board-support box">
          <h4>Support to ${support}</h4>
          <div class="content" id="support-board-content" data-cell-slug="${support}-support"></div>
        </div>
        <div class="board-staff box">
          <h4 id="staff-board-header">No Active staff</h4>
          <div class="content" id="staff-board-content" data-cell-slug="${name}-staff"></div>
        </div>
      </div>
    `;

    // listen for board events
    document
      .getElementById('close-board')
      .addEventListener('click', closeBoardHandler);

    document
      .getElementById('add-person')
      .addEventListener('click', addPersonHandler);

    // render active staff
    renderBoardStaff();

    // listen for cell events
    for (let cell of document.querySelectorAll('div[data-cell-slug]')) {
      cell.parentElement.addEventListener('click', e => {
        if (activePersonId) {
          console.log(e.currentTarget);
        }
      });
    }
  }
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
  const activeStaff = boards[activeBoardIdx].activeIds;

  let person;

  for (let i = 0; i < departmentStaff.length; i++) {
    if (!activeStaff.includes(departmentStaff[i].id)) {
      person = departmentStaff[i];
      activeStaff.push(departmentStaff[i].id);
      break;
    }
  }

  if (!person) return;

  const boardIdx = boards.findIndex(b => b.name == boards[activeBoardIdx].name);

  boards = [
    ...boards.slice(0, boardIdx),
    {
      ...boards[boardIdx],
      staff: [...boards[boardIdx].staff, person],
      activeStaff
    },
    ...boards.slice(boardIdx + 1)
  ];

  activeBoardIdx = boardIdx;

  renderBoardStaff();
};

(() => {
  renderBoardCards();
})();
