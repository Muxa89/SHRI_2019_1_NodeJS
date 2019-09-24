(function () {
  function MyPromise(executor) {
    this.onFulfill = undefined;
    this.onReject = undefined;

    var thisPromise = this;

    this.resolve = function (value) {
      if (this.onFulfill !== undefined) {
        this.onFulfill(value);
      }
    }

    this.reject = function (error) {
      if (this.onReject !== undefined) {
        this.onReject(error);
      }
    }

    setTimeout(function () {
      try {
        if (executor) {
          executor.bind(thisPromise)(thisPromise.resolve.bind(thisPromise), thisPromise.reject.bind(thisPromise));
        }
      } catch (err) {
        thisPromise.reject(err);
      }
    }, 0)


    this.then = function (successFn, failureFn) {
      var res = new MyPromise();

      this.onFulfill = function (value) {
        var successRes = successFn(value);
        if (successRes && successRes.then && typeof successRes.then === 'function') {
          successRes.then(function (succValue) {
            try {
              res.resolve(succValue);
            } catch (err) {
              res.reject(err);
            }
          });
        } else {
          res.resolve(successRes);
        }
      };

      this.onReject = function (err) {
        if (failureFn) {
          var failureRes = failureFn(err);
          res.resolve(failureRes);
        } else {
          res.reject(err);
        }
      };

      return res;
    };

    this.catch = function (failure) {
      return this.then(undefined, failure);
    }
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