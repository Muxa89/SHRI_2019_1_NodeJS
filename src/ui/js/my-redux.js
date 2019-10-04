(() => {
  const INIT = '@@init';
  const initAction = () => ({
    type: INIT
  });

  class Store {
    constructor(reducer) {
      this._reducer = reducer;
      this._state = undefined;
      this._listeners = {};
      this._listenerCounter = 0;
      this.dispatch = this.dispatch.bind(this);
      this.subscribe = this.subscribe.bind(this);
      this.getState = this.getState.bind(this);
      this.dispatch(initAction());
    }

    getState() {
      return this._state;
    }

    subscribe(callback) {
      this._listeners[this._listenerCounter] = callback;
      return (id => () => {
        delete this._listeners[id];
      })(this._listenerCounter++);
    }

    dispatch(action) {
      this._state = this._reducer(this._state, action);
      this._notifyListeners();
    }

    _notifyListeners() {
      Object.values(this._listeners).forEach(listener => listener(this._state));
    }
  }

  class View {
    constructor(el, store) {
      this._el = el;
      this._store = store;
      this._unsubscribe = store.subscribe(this._prepareRender.bind(this));
      this._prepareRender(store.getState());
    }

    destroy() {
      this._el.innerHTML = '';
      this._unsubscribe();
    }

    _prepareRender(state) {
      this._el.innerHTML = this.render(state);
    }

    render() {
      throw new Error('This method should be overriden');
    }
  }

  const thunk = store => next => action => {
    if (typeof action === 'function') {
      return action(store.dispatch, store.getState);
    }

    return next(action);
  };

  const applyMiddleware = (store, middlewares) => {
    middlewares = middlewares.slice();
    middlewares.reverse();
    let dispatch = store.dispatch;
    middlewares.forEach(middleware => (dispatch = middleware(store)(dispatch)));
    return Object.assign({}, store, { dispatch });
  };

  const createStore = (reducer, middlewares) => {
    return applyMiddleware(new Store(reducer), middlewares);
  };

  window.MyRedux = {
    Store,
    View,
    INIT,
    thunk,
    createStore
  };
})();
