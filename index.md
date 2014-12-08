# Getting started
### Getting started

Start by creating a `package.json`:

```bash
npm init
```

Install hapi and save it to your `package.json` dependencies:

```bash
npm install hapi --save
```

Create an `index.js` file with the following contents:

```javascript
var Hapi = require('hapi');

// Create a server with a port number
var server = new Hapi.Server(8000);

// Add the route
server.route({
    method: 'GET',
    path: '/hello',
    handler: function (request, reply) {

        reply('hello world');
    }
});

// Start the server
server.start();
```

Launch the application by running `node .` and open *localhost:8000/hello* in your browser.
