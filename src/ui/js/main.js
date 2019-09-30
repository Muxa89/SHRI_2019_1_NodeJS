/* eslint-disable no-undef */
const { Store, View, INIT } = window.MyRedux;

const tableInitialState = [
  {
    name: 'api',
    type: 'folder',
    commit: 'd53dsv',
    message: '[vcs] move http to arc',
    commiter: 'noxoomo',
    date: '4 s ago'
  },
  {
    name: 'ci',
    type: 'folder',
    commit: 'c53dsv',
    message: '[vcs] test for empty commit message',
    commiter: 'nikitxskv',
    date: '1 min ago'
  },
  {
    name: 'contrib',
    type: 'folder',
    commit: 's53dsv',
    message: '[vcs] change owner to g:arc',
    commiter: 'nalpp',
    date: '16:25'
  },
  {
    name: 'http',
    type: 'folder',
    commit: 'h5jdsv',
    message: '[vcs] move http to arc',
    commiter: 'somov',
    date: 'Yesterday, 14:50'
  },
  {
    name: 'lib',
    type: 'folder',
    commit: 'f5jdsv',
    message: 'ARCADIA-771: append /trunk/arcadia/',
    commiter: 'deshevoy',
    date: 'Jan 11, 12:01'
  },
  {
    name: 'local',
    type: 'folder',
    commit: 'k5jdsv',
    message: 'ARCADIA:771: detect binary files',
    commiter: 'exprmntr',
    date: 'Jan 10, 12:01'
  },
  {
    name: 'packages',
    type: 'folder',
    commit: 'a5jdsv',
    message: '[vcs] VCS-803: packages for services',
    commiter: 'levanov',
    date: 'Jan 1, 12:01'
  },
  {
    name: 'robots',
    type: 'folder',
    commit: 'l5jdsv',
    message: 'ARCADIA-771: convert string to json object',
    commiter: 'torkve',
    date: 'Dec 29, 2017'
  },
  {
    name: 'server',
    type: 'folder',
    commit: 'j5jdsv',
    message: '[vcs] get list of refs',
    commiter: 'spreis',
    date: 'Dec 29, 2017'
  },
  {
    name: 'ut',
    type: 'folder',
    commit: '5jdsvk',
    message: '[vsc] store merge conflicts',
    commiter: 'annaveronika',
    date: 'Dec 29, 2017'
  },
  {
    name: 'README.md',
    type: 'file',
    commit: 'h5jdsl',
    message: '[vcs] add readme',
    commiter: 'pg',
    date: 'Dec 29, 2017'
  },
  {
    name: 'ya.make',
    type: 'file',
    commit: 'k5jdsv',
    message: '[vcs] move http to arc',
    commiter: 'mvel',
    date: 'Dec 29, 2017'
  }
];

const UPDATE_ITEMS_ACTION = 'UPDATE_ITEMS_ACTION';
const updateItemsAction = name => ({
  type: UPDATE_ITEMS_ACTION,
  name
});

const reducer = (state, action) => {
  switch (action.type) {
    case UPDATE_ITEMS_ACTION:
      return _.assign({}, state, {
        tableData: tableInitialState.filter(
          value => value.name.indexOf(action.name) !== -1
        )
      });
    case INIT:
    default:
      return {
        tableData: tableInitialState
      };
  }
};

class InputView extends View {
  constructor(container, input, store) {
    super(container, store);
    this._input = input;
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
    this._store.dispatch(updateItemsAction(event.target.value));
  }

  _renderTableRow(row) {
    return `
      <div class="InfoTable-Row">
        <div class="InfoTable-Name">
          <div class="InfoTable-EntryIcon InfoTable-EntryIcon_type_folder"></div>
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

  render({ tableData }) {
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

    const rows = tableData.map(this._renderTableRow).join('');

    return header + rows + footer;
  }
}

const store = new Store(reducer);
store.subscribe(() => console.log(store.getState()));

const tableContainer = document.getElementById('info-table');
new InputView(
  tableContainer,
  document.getElementById('search-container'),
  store
);