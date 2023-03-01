let boards = [
  {
    name: 'stow',
    support: 'void',
    activeIds: [],
    staffMap: {},
    cells: [
      {
        name: 'main',
        classification: 'area',
        staff: [],
        elSelector: 'main-board-content'
      },
      {
        name: 'void',
        classification: 'support',
        staff: [],
        elSelector: 'support-board-content'
      },
      {
        name: 'active',
        classification: 'active',
        staff: [],
        elSelector: 'staff-board-content'
      }
    ]
  },
  {
    name: 'dock',
    support: 'stow',
    activeIds: [],
    staffMap: {},
    cells: [
      {
        name: 'main',
        classification: 'area',
        staff: [],
        elSelector: 'main-board-content'
      },
      {
        name: 'stow',
        classification: 'support',
        staff: [],
        elSelector: 'support-board-content'
      },
      {
        name: 'active',
        classification: 'active',
        staff: [],
        elSelector: 'staff-board-content'
      }
    ]
  }
];

let activeBoardIdx = null;
let activePersonId = null;

const people = [
  { id: 1, name: 'Nichole', surname: 'Cotton', department: 'stow' },
  { id: 2, name: 'Dennis', surname: 'Davis', department: 'stow' },
  { id: 3, name: 'Ronald', surname: 'Hailey', department: 'stow' },
  { id: 4, name: 'Leanne', surname: 'Ward', department: 'stow' },
  { id: 5, name: 'Michael', surname: 'Moe', department: 'stow' },
  { id: 6, name: 'Jonathan', surname: 'Broadnax', department: 'stow' },
  { id: 7, name: 'Katharine', surname: 'Greenwalt', department: 'stow' },
  { id: 8, name: 'Martha', surname: 'Martinez', department: 'stow' },
  { id: 9, name: 'Anthony', surname: 'Nelson', department: 'stow' },
  { id: 10, name: 'Carmen', surname: 'Doyle', department: 'stow' },
  { id: 11, name: 'Jennifer', surname: 'Ferguson', department: 'stow' },
  { id: 12, name: 'Jose', surname: 'Clark', department: 'stow' },
  { id: 13, name: 'James', surname: 'Heisler', department: 'stow' },
  { id: 14, name: 'Joseph', surname: 'Berge', department: 'stow' },
  { id: 15, name: 'Rebecca', surname: 'Snell', department: 'stow' },
  { id: 16, name: 'Eva', surname: 'Gonzalez', department: 'dock' },
  { id: 17, name: 'Joel', surname: 'Quigley', department: 'dock' },
  { id: 18, name: 'Michael', surname: 'Dykes', department: 'dock' },
  { id: 19, name: 'Stephen', surname: 'Strand', department: 'dock' },
  { id: 20, name: 'Nancy', surname: 'Rodriquez', department: 'dock' }
];

let socket;
