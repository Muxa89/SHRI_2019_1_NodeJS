(function () {
  const executeSafely = function (fn, arg, onSuccess, onError) {
    try {
      onSuccess(fn(arg));
    } catch (err) {
      onError(err);
    }
  }

  function MyPromise(executor) {
    this._executor = executor;

    this._listeners = [];

    this._resolve = function (value) {
      this._listeners.forEach(function (listener) {
        try {
          listener.resolve(value);
        } catch (err) {
          listener.reject(err);
        }
      }.bind(this));
    }.bind(this);

    this._reject = function (err) {
      this._listeners.forEach(function (listener) {
        try {
          listener.reject(err);
        } catch (errInListener) {
          listener.reject(errInListener);
        }
      }.bind(this));
    }.bind(this);

    this._execution = function () {
      try {
        if (this._executor) {
          this._executor(this._resolve, this._reject);
        } else {
          throw new Error('No executor function provided.');
        }
      } catch (err) {
        this._reject(err);
      }
    }.bind(this);

    this.then = function (onFulfilled, onRejected) {
      const res = new MyPromise(function () { });

      this._listeners.push({
        resolve: function (value) {
          if (value && value.then && typeof (value.then) === 'function') {
            value.then(function (thenValue) {
              executeSafely(onFulfilled, thenValue, res._resolve, res._reject);
            });
          } else {
            res._resolve(onFulfilled ? onFulfilled(value) : value);
          }
        },
        reject: function (err) {
          if (onRejected) {
            executeSafely(onRejected, err, res._resolve, res._reject);
          } else {
            res._reject(err);
          }
        }
      });
      return res;
    }.bind(this);

    this.catch = function (catchOnReject) {
      return this.then(undefined, catchOnReject);
    }.bind(this);

    setTimeout(this._execution, 0);
  }

  var globalObject;
  if (typeof window !== 'undefined') {
    globalObject = window;
  } else if (typeof global !== 'undefined') {
    globalObject = global;
  }
  if (!globalObject) return;

  if (!globalObject.Promise) {
    globalObject.Promise = MyPromise;
  }

  globalObject.MyPromise = MyPromise;
})();

// Проверка работоспособности
var promise = new MyPromise(function (resolve) {
  setTimeout(resolve, 1000, 42);
});

promise
  .then(function (value) {
    console.log(value); //42
    return value + 1;
  })
  .then(function (value) {
    console.log(value); // 43
    return new Promise(function (resolve) { resolve(137) })
  })
  .then(function (value) {
    console.log(value); // 137
    return new MyPromise(function (resolve) { resolve(444) })
  })
  .then(function (value) {
    console.log(value) // 444
    throw new Error("Error Message")
  })
  .then(function () {
    console.log('Будет проигнорировано')
  })
  .catch(function (err) {
    console.log('catched error: ' + err.message);
  })
  .then(function () {
    console.log('123'); //123
  });