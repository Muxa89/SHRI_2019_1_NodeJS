/* eslint-disable no-undef */
const { View, INIT, thunk, createStore } = window.MyRedux;

const BACKEND_ADDRESS = 'http://localhost:3000';
const API_URL = '/api/repos/';

const SET_TABLE_DATA = 'SET_TABLE_DATA';
const setTableDataAction = items => ({
  type: SET_TABLE_DATA,
  items
});

const SET_FILTER = 'SET_FILTER';
const setFilterAction = filter => ({
  type: SET_FILTER,
  filter
});

// { name: "api", type: "folder", commit: "d53dsv", message: "[vcs] move http to arc", commiter: "noxoomo", date: "4 s ago" },
const getItemsAction = () => dispatch => {
  axios.get(BACKEND_ADDRESS + API_URL + window.repositoryId).then(response => {
    dispatch(
      setTableDataAction(
        response.data.map(value => {
          return {
            name: value,
            type:
              window.repositoryId === '' || value.indexOf('/') !== -1
                ? 'folder'
                : 'file',
            commit: '',
            message: '',
            commiter: '',
            date: ''
          };
        })
      )
    );
  });
};

const getFilteredItemsIndex = (items, filter) => {
  if (filter === '') {
    return items.map((item, index) => index);
  }

  const res = [];
  items.forEach((item, index) => {
    if (item.indexOf(filter) !== -1) {
      res.push(index);
    }
  });
  return res;
};

const reducer = (state, action) => {
  switch (action.type) {
    case SET_FILTER:
      return _.assign({}, state, {
        filter: action.filter,
        visibleItems: getFilteredItemsIndex(
          state.tableData.map(value => value.name),
          action.filter
        )
      });
    case SET_TABLE_DATA:
      return _.assign({}, state, {
        tableData: action.items,
        visibleItems: getFilteredItemsIndex(
          action.items.map(value => value.name),
          state.filter
        )
      });
    case INIT:
    default:
      return {
        filter: '',
        tableData: [],
        visibleItems: []
      };
  }
};

class InputView extends View {
  constructor(container, filterInput, store) {
    super(container, store);
    this._input = filterInput;
    this._onInput = this._onInput.bind(this);
    this._input.addEventListener('keyup', this._onInput);

    this._unsubscribe = store.subscribe(state => {
      container.innerHTML = this.render(state);
    });
  }

  destroy() {
    super.destroy();
    this._input.removeEventListener('keyup', this._onInput);
    this._unsubscribe();
  }

  _onInput(event) {
    this._store.dispatch(setFilterAction(event.target.value));
  }

  _renderTableRow(row) {
    return `
      <div class="InfoTable-Row">
        <div class="InfoTable-Name">
          <div class="InfoTable-EntryIcon InfoTable-EntryIcon_type_${row.type}"></div>
          <div class="InfoTable-Text">${row.name}</div>
        </div>
        <div class="InfoTable-Commit">
          <div class="InfoTable-Text Link">${row.commit}</div>
        </div>
        <div class="InfoTable-Message">${row.message}</div>
        <div class="InfoTable-Commiter Commiter">${row.commiter}</div>
        <div class="InfoTable-Date">${row.date}</div>
      </div>
    `;
  }

  render({ tableData, visibleItems }) {
    const header = `
      <div class="InfoTable">
        <div class="InfoTable-Header">
          <div class="InfoTable-Name">Name</div>
          <div class="InfoTable-Commit">Last commit</div>
          <div class="InfoTable-Message">Commit message</div>
          <div class="InfoTable-Commiter">Commiter</div>
          <div class="InfoTable-Date">Updated</div>
        </div>
    `;
    const footer = '</div>';

    const rows = tableData
      .filter((item, index) => visibleItems.indexOf(index) !== -1)
      .map(this._renderTableRow)
      .join('');

    return header + rows + footer;
  }
}

const store = createStore(reducer, [thunk]);
store.subscribe(() => console.log(store.getState()));

new InputView(
  document.getElementById('info-table'),
  document.getElementById('search-container'),
  store
);

store.dispatch(getItemsAction());
