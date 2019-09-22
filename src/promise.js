function MyPromise(executor) {
  var onFulfill = undefined;
  var onReject = undefined;

  var resolve = function (value) {
    if (onFulfill !== undefined) {
      onFulfill(value);
    }
  };

  var reject = function (error) {
    if (onReject !== undefined) {
      onReject(error);
    }
  };

  setTimeout(function () {
    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }, 0);

  var thenFunction = function (success, failure) {
    return new MyPromise(function (resolve, reject) {
      onFulfill = function (value) {
        resolve(success(value));
      };
      onReject = function (err) {
        reject(failure(err));
      };
    });
  };

  var catchFunction = function (failure) {
    return thenFunction(undefined, failure);
  }

  return {
    then: thenFunction,
    catch: catchFunction
  };
}

// Проверка работоспособности
var promise = new Promise(function (resolve) {
  resolve(42)
})

promise
  .then(function (value) {
    return value + 1
  })
  .then(function (value) {
    console.log(value) // 43
    return new Promise(function (resolve) { resolve(137) })
  })
  .then(function (value) {
    console.log(value) // 137
    throw new Error("Error Message")
  })
  .then(function () {
    console.log('Будет проигнорировано')
  })
  .catch(function (err) {
    console.log(err.message);
  })
  .then(function () {
    console.log('123');
  })

