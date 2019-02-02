## Testing

_This tutorial is compatible with hapi v17_

### Testing routes

Hapi is designed for creating robust, testable applications. To this end, Hapi includes the ability to test routes without having to actually start a server, completely avoiding the time overheads and added complexity of the TCP protocol.

This tutorial goes into a basic setup for testing routes, and outlines one possible setup for a testable application.

### The server

Taking the server example from the [Getting Started](https://hapijs.com/tutorials/getting-started) tutorial, we make a minor modification to it, such that it doesn't automatically start when referenced from our tests. We also add a simple route from the [Routing Tutorial](https://hapijs.com/tutorials/routing) that we want to test.

You might call this file `server.js` and place it in the `lib` directory of your project.

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
  method: 'GET',
  path: '/some/route',
  handler: function () {

      return 'Hello!';
  }
});

exports.init = async () => {

    await server.initialize();
    return server;
};

exports.start = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
    return server;
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

```

Note that we call `server.initialize` in our `init` method. We still want Hapi to set up all our server concerns, such as [caching](https://hapijs.com/tutorials/caching).

Next, we create our main entrypoint for the server. This might be the file referenced by the `main` attribute of your `package.json`. It is run when your application starts. 

```javascript
'use strict';

const { start, stop } = require('lib/server');

start();
```

What we've created here is a way of starting the server normally by calling its `start` function in our entrypoint, and exposing a port for external HTTP traffic, but we've also got a module which doesn't do anything by default, which we can use in our tests.

### Writing a route test

In this example we'll use [lab](https://github.com/hapijs/lab), but the same method can be used for any testing tool such as [Mocha](https://mochajs.org/), [Jest](https://jestjs.io/), [Tap](https://www.node-tap.org/), [Ava](https://github.com/avajs) etc.

You should probably install mocha and code before trying to run this:

```bash
npm install --save-dev lab code
```

Then, create a file called `example.test.js` in the `test` directory.

```javascript
'use strict'

const Lab = require('lab');
const { expect } = require('code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../lib/server');

describe('GET /some/route', () => {
    let server;

    beforeEach(async () => {
        server = await init();
    });
    
    afterEach(async () => {
        await server.stop();
    });
    
    it('responds with 200', async () => {
        const res = await server.inject({
            method: 'get',
            url: '/some/route'
        });
        expect(res.statusCode).to.equal(200);
    });
});

```

Note that we call `init` rather than `start` to set up the server, which means that the server starts, but does not listen on a socket. After each test we call `stop` to cleanup and stop the server.

You will note the use of `inject` on the server. `inject` uses [Shot](https://github.com/hapijs/shot) to `inject` a request directly into Hapi's route handler. This is the magic which allows us to test HTTP methods.

To run the tests, you can modify the `package.json` of your project to run your test runner:

```json
  "scripts": {
    "test": "lab -v **/*.spec.js"
  }
```
