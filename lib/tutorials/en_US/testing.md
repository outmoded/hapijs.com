# Testing

_This tutorial is compatible with hapi v17_

- [Overview](#overview)
- [lab](#lab)
- [code](#code)
- [Server Setup](#server)
- [Writing a Route Test](#writingTest)



## <a name="overview" /> Overview
Hapi is designed for creating robust, testable applications. To this end, Hapi includes the ability to test routes without having to actually start a server, completely avoiding the time overheads and added complexity of the TCP protocol.

This tutorial goes into a basic setup for testing routes, and outlines one possible setup for a testable application using [lab](https://github.com/hapijs/lab) and [code](https://github.com/hapijs/code).

## <a name="lab" /> lab

`lab` is a simple test utility for Node.js. Unlike other test utilities, lab uses only async/await features and includes everything you should expect from a modern Node.js test utility. `lab` works with any assertion library that throws an error when a condition isn't met. For this tutorial, you will be using the `code` assertion library.

To install `lab`, type the following in your terminal:

`npm install --save-dev @hapi/lab`

## <a name="code" /> code

`code` is based on the `chai` assertions library. It was created to be a small, simple, and intuitive assertions library that could be run without plugins, extensions, and have low overhead.

To install `code`, type the following in your terminal:

`npm install --save-dev @hapi/code`

## <a name="server" /> Server Setup

Taking the server example from the Getting Started tutorial, we make a minor modification to it, such that it doesn't automatically start when referenced from our tests. You might call this file `server.js` and place it in the `lib` directory of your project:

```js
'use strict';

const Hapi = require('@hapi/hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
  method: 'GET',
  path: '/',
  handler: function () {

      return 'Hello World!';
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
You now export, but do not call, `init()` and `start()`. This will allow you to initialize and start the server from different files. The `init()` function will initialize the server (starts the caches, finalizes plugin registration) but does not start the server. This is what you will use in your tests. The `start()` function will actually start the server. This is what you will use in our main entry-point for the server:

```js
`use strict`;

const { start } = require('lib/server');

start();
```
What you've created here is a way of starting the server normally by calling its start function in our entry-point, and exposing a port for external HTTP traffic, but you've also got a module which doesn't do anything by default, which you can use in our tests.

## <a name="writingTest" /> Writing a Route Test

In this example you'll use [lab](https://github.com/hapijs/lab), but the same method can be used for any testing tool such as [Mocha](https://mochajs.org/), [Jest](https://jestjs.io/), [Tap](https://www.node-tap.org/), [Ava](https://github.com/avajs) etc.

By default, `lab` loads all the '*.js' files inside the local `test` directory and executes the tests found. To use different directories or files, pass the file or directories as arguments:

`$  lab unit.js`

To get started, create a file called `example.test.js` in the `test` directory:

```js
'use strict';

const Lab = require('@hapi/lab');
const { expect } = require('@hapi/code');
const { afterEach, beforeEach, describe, it } = exports.lab = Lab.script();
const { init } = require('../lib/server');

describe('GET /', () => {
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
            url: '/'
        });
        expect(res.statusCode).to.equal(200);
    });
});
```
Here you are testing whether or not our `'GET'` route will respond with a `200` status code. You first call `describe()` to provide the structure of your test. `describe()` takes two parameters, a description of the test, and the function that will setup the test.  

Note that you call `init` rather than `start` to set up the server, which means that the server starts, but does not listen on a socket. After each test you call `stop` to cleanup and stop the server.

The `it()` function is what will run your test. `it()` takes two parameters, a description of a successful test, and a function to run the test. 

You will note the use of `inject` on the server. `inject` uses [Shot](https://github.com/hapijs/shot) to `inject` a request directly into hapi's route handler. This is the magic which allows us to test HTTP methods.

To run the tests, you can modify the `package.json` of your project to run your test runner:

```json
  "scripts": {
    "test": "lab -v **/*.test.js"
  }
```
