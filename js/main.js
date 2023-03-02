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

const parseBadgeColor = department => {
  switch (department) {
    case 'stow':
      return 'var(--color-green)';
    case 'dock':
      return 'var(--color-rose)';
    default:
      return 'var(--color-dark)';
  }
};

const renderBoardStaff = () => {
  if (activeBoardIdx != null) {
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
            <span class="department" style="color: ${parseBadgeColor(
              department
            )}">${department}</span>
          </div>
        `
        )
        .join('');
    }

    // listen for badge events
    for (let badge of document.querySelectorAll('.board-badge')) {
      badge.addEventListener('click', selectPersonHandler);
    }
  }
};

const renderActiveBoard = () => {
  const boardWrapper = document.getElementById('active-board-wrapper');

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
      .addEventListener('click', addPersonBoardHandler);

    // render active staff
    renderBoardStaff();

    // listen for cell events
    for (let cell of document.querySelectorAll('div[data-cell-slug]')) {
      cell.parentElement.addEventListener('click', e =>
        movePersonBoardHandler(e, cell)
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

const addPerson = (addTo, personId) => {
  const targetCellDepartment = addTo.split('-')[0];

  const boardIdx = boards.findIndex(({ name }) => name == targetCellDepartment);

  let activeStaff = boards[boardIdx].activeIds;

  if (activeStaff.includes(personId)) {
    return;
  }

  const person = people.find(({ id }) => id == personId);

  if (person) {
    const cellIdx = boards[boardIdx].cells.findIndex(c => c.name == 'active');

    const staffMap = {
      ...boards[boardIdx].staffMap
    };

    activeStaff = [...activeStaff, person.id];

    const cellSlug = `${targetCellDepartment}-active-active`;

    staffMap[`id${personId}`] = cellSlug;

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
        activeIds: activeStaff,
        staffMap
      },
      ...boards.slice(boardIdx + 1)
    ];
  }
};

const addPersonBoardHandler = () => {
  const departmentName = boards[activeBoardIdx].name;
  const departmentStaff = people.filter(p => p.department == departmentName);
  let activeStaff = boards[activeBoardIdx].activeIds;

  let person;

  for (let i = 0; i < departmentStaff.length; i++) {
    if (!activeStaff.includes(departmentStaff[i].id)) {
      person = departmentStaff[i];
      break;
    }
  }

  if (person) {
    addPerson(`${departmentName}-active-active`, person.id);
  } else {
    return;
  }

  if (socket && socket.readyState == WebSocket.OPEN) {
    const eventObj = {
      type: 'personAdd',
      personId: person.id,
      target: `${departmentName}-active-active`
    };

    socket.send(JSON.stringify(eventObj));
  }

  activePersonId = null;
  renderBoardStaff();
};

const selectPersonHandler = ({ currentTarget }) => {
  if (activePersonId) {
    document.querySelector('.board-badge.active').classList.remove('active');
  }

  activePersonId = parseInt(currentTarget.dataset.id);
  currentTarget.classList.add('active');
};

const movePerson = (moveFrom, moveTo, personId) => {
  const [sourceCellDepartment, sourceCellClassification, sourceCellName] =
    moveFrom.split('-');

  const [targetCellDepartment, targetCellClassification, targetCellName] =
    moveTo.split('-');

  const boardIdx = boards.findIndex(({ name }) => name == sourceCellDepartment);

  const staffMap = {
    ...boards[boardIdx].staffMap
  };

  const oldCellIdx = boards[boardIdx].cells.findIndex(
    ({ name, classification }) =>
      name == sourceCellName && classification == sourceCellClassification
  );

  const newCellIdx = boards[boardIdx].cells.findIndex(
    ({ name, classification }) =>
      name == targetCellName && classification == targetCellClassification
  );

  const person = people.find(({ id }) => id == personId);

  const cells = [...boards[boardIdx].cells];

  cells[oldCellIdx].staff = cells[oldCellIdx].staff.filter(
    ({ id }) => id != personId
  );
  cells[newCellIdx].staff = [...cells[newCellIdx].staff, person];

  staffMap[`id${personId}`] = moveTo;

  boards = [
    ...boards.slice(0, boardIdx),
    {
      ...boards[boardIdx],
      cells,
      staffMap
    },
    ...boards.slice(boardIdx + 1)
  ];
};

const movePersonBoardHandler = (event, cell) => {
  if (activePersonId) {
    const { cellSlug } = cell.dataset;

    const currentPersonLocation =
      boards[activeBoardIdx].staffMap[`id${activePersonId}`];

    const sameCell = cellSlug == currentPersonLocation;
    const toVoid = cellSlug.includes('void');

    const toSupport = cellSlug.includes('-support-');
    const fromSupport = currentPersonLocation.includes('-support-');

    if (!sameCell && !toVoid) {
      movePerson(currentPersonLocation, cellSlug, activePersonId);

      if (toSupport) {
        const targetDepartment = cellSlug.split('-')[2];
        addPerson(`${targetDepartment}-active-active`, activePersonId);
      }

      if (fromSupport) {
        const sourceDepartment = currentPersonLocation.split('-')[2];
        removePerson(sourceDepartment, activePersonId);
      }

      if (socket && socket.readyState == WebSocket.OPEN) {
        const eventObj = {
          type: 'personMove',
          source: currentPersonLocation,
          target: cellSlug,
          personId: activePersonId,
          toSupport,
          fromSupport
        };

        socket.send(JSON.stringify(eventObj));
      }

      activePersonId = null;
      renderActiveBoard();
    }
  }
};

const removePerson = (removeFrom, personId) => {
  const boardIdx = boards.findIndex(({ name }) => name == removeFrom);

  if (!boards[boardIdx].activeIds.includes(personId)) {
    return;
  }

  const [cellDepartment, cellClassification, cellName] =
    boards[boardIdx].staffMap[`id${personId}`].split('-');

  const cellIdx = boards[boardIdx].cells.findIndex(
    ({ classification, name }) =>
      cellClassification == classification && cellName == name
  );

  const activeIds = boards[boardIdx].activeIds.filter(id => id != personId);
  delete boards[boardIdx].staffMap[`id${personId}`];

  boards = [
    ...boards.slice(0, boardIdx),
    {
      ...boards[boardIdx],
      cells: [
        ...boards[boardIdx].cells.slice(0, cellIdx),
        {
          ...boards[boardIdx].cells[cellIdx],
          staff: boards[boardIdx].cells[cellIdx].staff.filter(
            ({ id }) => id != personId
          )
        },
        ...boards[boardIdx].cells.slice(cellIdx + 1)
      ],
      activeIds
    },
    ...boards.slice(boardIdx + 1)
  ];
};

const delegateRelayEvent = e => {
  switch (e.type) {
    case 'personAdd': {
      const { personId, target } = e;
      const departmentName = target.split('-')[0];
      addPerson(target, personId);

      if (
        activeBoardIdx != null &&
        departmentName == boards[activeBoardIdx].name
      ) {
        renderBoardStaff();
      }

      break;
    }
    case 'personMove': {
      const { personId, source, target, toSupport, fromSupport } = e;
      movePerson(source, target, personId);

      if (toSupport) {
        const targetDepartment = target.split('-')[2];
        addPerson(`${targetDepartment}-active-active`, personId);
      }

      if (fromSupport) {
        const sourceDepartment = source.split('-')[2];
        removePerson(sourceDepartment, personId);
      }

      if (activeBoardIdx != null) {
        renderActiveBoard();
      }

      break;
    }
  }
};

const connectToRelay = () => {
  let socket;

  try {
    socket = new WebSocket('ws://localhost:8080/boards');
  } catch {
    return null;
  }

  socket.addEventListener('open', () => {
    console.log('Socket connected');
  });

  socket.addEventListener('error', err => {
    console.log(err);
  });

  socket.addEventListener('close', () => {
    console.log('Socket disconnected');
  });

  socket.addEventListener('message', e => {
    const eventObj = JSON.parse(e.data);
    delegateRelayEvent(eventObj);
  });

  return socket;
};

(() => {
  renderBoardCards();

  socket = connectToRelay();
})();
