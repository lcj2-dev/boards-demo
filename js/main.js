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
  for (let c of boards[activeBoardIdx].cells) {
    const { staff, elSelector } = c;
    const container = document.getElementById(elSelector);

    container.innerHTML = staff
      .map(
        ({ name, surname, department, id }) => `
        <div class="board-badge ${
          activePersonId == id && 'active'
        }" data-id="${id}">
          <span>${name} ${surname}</span>
          <span>${department}</span>
        </div>
      `
      )
      .join('');
  }

  // listen for badge events
  for (let badge of document.querySelectorAll('.board-badge')) {
    badge.addEventListener('click', selectPersonHandler);
  }
};

const renderActiveBoard = () => {
  const boardWrapper = document.getElementById('active-board-wrapper');
  // const boardContainer = document.getElementById('main-board-content');

  activePersonId = null;

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
          <div class="grid" id="main-board-content" data-cell-slug="${name}-area-main"></div>
        </div>
        <div class="board-support box">
          <h4>Support to ${support}</h4>
          <div class="content" id="support-board-content" data-cell-slug="${name}-support-${support}"></div>
        </div>
        <div class="board-staff box">
          <h4>Staff</h4>
          <div class="content" id="staff-board-content" data-cell-slug="${name}-active-active"></div>
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
      cell.parentElement.addEventListener('click', e =>
        moveEventHandler(e, cell)
      );
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
  const cellIdx = boards[boardIdx].cells.findIndex(c => c.name == 'active');

  const staffMap = {
    ...boards[boardIdx].staffMap
  };

  staffMap[`id${person.id}`] = `${boards[activeBoardIdx].name}-active-active`;

  boards = [
    ...boards.slice(0, boardIdx),
    {
      ...boards[boardIdx],
      cells: [
        ...boards[boardIdx].cells.slice(0, cellIdx),
        {
          ...boards[boardIdx].cells[cellIdx],
          staff: [...boards[boardIdx].cells[cellIdx].staff, person]
        },
        ...boards[boardIdx].cells.slice(cellIdx + 1)
      ],
      activeStaff,
      staffMap
    },
    ...boards.slice(boardIdx + 1)
  ];

  activeBoardIdx = boardIdx;

  renderBoardStaff();
};

const selectPersonHandler = ({ currentTarget }) => {
  if (activePersonId) {
    document.querySelector('.board-badge.active').classList.remove('active');
  }

  activePersonId = parseInt(currentTarget.dataset.id);
  currentTarget.classList.add('active');
};

const moveEventHandler = (event, cell) => {
  if (activePersonId) {
    const { cellSlug } = cell.dataset;
    const { support } = boards[activeBoardIdx];

    const currentPersonLocation =
      boards[activeBoardIdx].staffMap[`id${activePersonId}`];

    const [sourceCellDepartment, sourceCellClassification, sourceCellName] =
      currentPersonLocation.split('-');

    const [targetCellDepartment, targetCellClassification, targetCellName] =
      cellSlug.split('-');

    const isInternal = targetCellClassification != 'support';
    const sameCell = cellSlug == currentPersonLocation;

    if (!sameCell) {
      const staffMap = {
        ...boards[activeBoardIdx].staffMap
      };

      const oldCellIdx = boards[activeBoardIdx].cells.findIndex(
        ({ name, classification }) =>
          name == sourceCellName && classification == sourceCellClassification
      );

      const newCellIdx = boards[activeBoardIdx].cells.findIndex(
        ({ name, classification }) =>
          name == targetCellName && classification == targetCellClassification
      );

      const person = people.find(({ id }) => id == activePersonId);

      const cells = [...boards[activeBoardIdx].cells];

      cells[oldCellIdx].staff = cells[oldCellIdx].staff.filter(
        ({ id }) => id != activePersonId
      );
      cells[newCellIdx].staff.push(person);

      staffMap[`id${activePersonId}`] = cellSlug;

      boards = [
        ...boards.slice(0, activeBoardIdx),
        {
          ...boards[activeBoardIdx],
          cells,
          staffMap
        },
        ...boards.slice(activeBoardIdx + 1)
      ];

      activePersonId = null;

      renderActiveBoard();
    }
  }
};

(() => {
  renderBoardCards();
})();
