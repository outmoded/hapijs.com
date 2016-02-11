## Server methods

Server methods are a useful way of sharing functions by attaching them to your server object rather than requiring a common module everywhere it is needed. To register a server method, you need access to the `server` object. Two different forms are available, either passing separate parameters:

```javascript
const add = function (x, y, next) {
    // note that the 'next' callback must be used to return values
    next(null, x + y);
};

server.method('add', add, {});
```

Or an object with `name`, `method`, and `options` parameters (note that you may also pass an array of these objects):

```javascript
const add = function (x, y, next) {
    next(null, x + y);
};

server.method({
    name: 'add',
    method: add,
    options: {}
});
```

## Name

The `name` parameter is a string used to retrieve the method from the server later, via `server.methods[name]`. Note that if you specify a `name` with a `.` character, it is registered as a nested object rather than the literal string. As in:

```javascript
server.method('math.add', add);
```

becomes accessible as server.methods.math.add

## Function

The `method` parameter is the actual function to call when the method is invoked. It can take any number of arguments but *must* accept a callback as its last parameter. The callback accepts three parameters: `err`, `result`, and `ttl`. If an error occurs in your method, pass it as the first argument. If there was no error, the first argument should be undefined or null and the return value passed as the second argument. The `ttl` argument is used to tell hapi how long the return value can be cached; if it is specified as `0` then the value will never be cached.

## Caching

Speaking of caching, another major advantage of server methods is that they may leverage hapi's native caching. The default is to not cache, however if a valid configuration is passed when registering the method, the return value will be cached and served from there instead of re-running your method every time it is called. The configuration looks like the following:

```javascript
server.method('add', add, {
    cache: {
        expiresIn: 60000,
        expiresAt: '20:30',
        staleIn: 30000,
        staleTimeout: 10000,
        generateTimeout: 100
    }
});
```

The parameters mean:

* `expiresIn`: relative expiration expressed in the number of milliseconds since the item was saved in the cache. Cannot be used together with `expiresAt`.
* `expiresAt`: time of day expressed in 24h notation using the 'HH:MM' format, at which point all cache records for the route expire. Uses local time. Cannot be used together with `expiresIn`.
* `staleIn`: number of milliseconds to mark an item stored in cache as stale and attempt to regenerate it. Must be less than `expiresIn`.
* `staleTimeout`: number of milliseconds to wait before returning a stale value while generateFunc is generating a fresh value.
* `generateTimeout`: number of milliseconds to wait before returning a timeout error when it takes too long to return a value. When the value is eventually returned, it is stored in the cache for future requests.
* `segment`: an optional segment name used to isolate cache items.
* `cache`: an optional string with the name of the cache connection configured on your server to use

More information on the caching options can be found in the [API Reference](/api#servermethodmethod) as well as the documentation for [catbox](https://github.com/hapijs/catbox#policy).

## Generate a custom key

In addition to the above options, you may also pass a custom function used to generate a key based on the parameters passed to your method. If your method only accepts some combination of string, number, and boolean values hapi will generate a sane key for you. However, if your method accepts an object parameter, you should specify a function that will generate a key similar to the following:

```javascript
const sum = function (array, next) {
    let total = 0;

    array.forEach((item) => {
        total += item;
    });

    next(null, total);
};

server.method('sum', sum, {
    generateKey: function (array) {
        return array.join(',');
    }
});
```

Any arguments that are passed to your method are available to the generateKey method, but *not* the callback.

## Bind

The last option available to server methods is `bind`. The `bind` option changes the `this` context within the method. It defaults to the current active context when the method is added. This can be useful for passing in a database client without needing to pass it as a parameter and requiring a custom `generateKey` function, as in:

```javascript
const lookup = function (id, next) {
    // calls myDB.getOne
    this.getOne({ id: id }, (err, value) => {
        next(err, value);
    });
};

server.method('lookup', lookup, { bind: myDB });
```
