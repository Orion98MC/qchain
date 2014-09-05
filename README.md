# Qchain 

Qchain is a simple serial promise chain with Q which keeps track of its own tail and may call a last function when the tail is reached.

## Depends on

* Q

## Usage

```js
var QChain = require('qchain');

var chain = Qchain();

chain.last(function() { 
  console.log('I am called last');
}).then(function() {
  console.log('I am called first');
});
```

## API

* chain.then()
Same as Q-promise.then()

* chain.thenResolve()
Same as Q-promise.thenResolve()

* chain.fail()
Same as Q-promise.fail()

* chain.last(Function)
registers the given function to be run as last-of-chain. 
The function gets "this" set from the last promise of the chain.

* chain.promise
Returns the promise associated with the chain completion.