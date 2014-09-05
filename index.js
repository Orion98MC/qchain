var Q = require('q');

function qchain(promise, last_fn) {
  return new QChain(promise, last_fn);
}

function QChain(promise, last_fn) {
  if (typeof promise === 'function') {
    last_fn = promise;
    promise = null;
  }
  
  this.name = "Unnamed chain";
  this._tail = Q.when(promise);
  this._deferred = Q.defer();
  this.promise = this._deferred.promise;
  
  var self = this;
  this.last(last_fn || function () { 
   // console.log('[Last of chain]', self.name);
  });
  
  return this;
}

QChain.prototype.finalize = function (tail) {
  if (tail.isFulfilled()) {
    // console.log('[QChain] resolve', this.name);
    this._deferred.resolve(tail.inspect().value);
  } else {
    // console.log('[QChain] reject', this.name);
    this._deferred.reject(tail.inspect().reason);
  }
  this._last.call(tail);
};

QChain.prototype.then = function () {
  this._tail = this._tail.then.apply(this._tail, arguments);
  return this;
};

QChain.prototype.thenResolve = function () {
  this._tail = this._tail.thenResolve.apply(this._tail, arguments);
  return this;
};

QChain.prototype.fail = function () {
  this._tail = this._tail.fail.apply(this._tail, arguments);
  return this;  
};

QChain.prototype.last = function (fn) {
  var self = this;
  this._last = fn;
  
  // Leave a chance to enqueue then-s, see you on next tick.
  process.nextTick(function tryLast() {
    var tail = self._tail; // Record the current tail
    var last = self._tail.finally(function () {
      if (self._tail === last) { // We are indeed the last added promise
        self.finalize(tail);
      } else {
        // console.log('Wrong last, retrying...');
        tryLast();
      }
    });
    self._tail = last; // Set ourselves as the tail
  });
  return this;
};

module.exports = qchain;