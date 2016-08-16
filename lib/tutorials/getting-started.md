## Installing hapi

_This tutorial is compatible with hapi v11.x.x._

Create a new directory `myproject`, and from there:

* Run: `npm init` and follow the prompts, this will generate a package.json file for you.
* Run: `npm install --save hapi` this installs hapi, and saves it in your package.json as a dependency of your project.

That's it! You now have everything you need in order to create a server using hapi.

## Creating a server

The most basic server looks like the following:

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
```

First, we require hapi. Then we create a new hapi server object. After that we add a connection to the server,  passing in a port
number to listen on. After that, start the server and log that it's running.

When adding the server connection, we can also provide a hostname, IP address, or even
a Unix socket file, or Windows named pipe to bind the server to. For more details, see [the API reference](/api/#serverconnectionoptions).

## Adding routes

Now that we have a server we should add one or two routes so that it actually does something. Let's see what that looks like:

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
```

Save the above as `server.js` and start the server with the command `node server.js`. Now you'll find that if you visit http://localhost:3000 in your browser, you'll see the text `Hello, world!`, and if you visit http://localhost:3000/stimpy you'll see `Hello, stimpy!`.

Note that we URI encode the name parameter, this is to prevent content injection attacks. Remember, it's never a good idea to render user provided data without output encoding it first!

The `method` parameter can be any valid HTTP method, array of HTTP methods, or an asterisk to allow any method. The `path` parameter defines the path including parameters. It can contain optional parameters, numbered parameters, and even wildcards. For more details, see [the routing tutorial](/tutorials/routing).

## Creating static pages and content

We've proven that we can start a simple Hapi app with our Hello World application. Next, we'll use a plugin called **inert** to serve a static page. Before you begin, stop the server with **CTRL + C**.

To install inert run this command at the command line: `npm install --save inert` This will download inert and add it to your `package.json`, which documents which packages are installed.

Add the following to your `server.js` file:

``` javascript
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            reply.file('./public/hello.html');
        }
    });
});


```

The `server.register()` command above adds the inert plugin to your Hapi application. If something goes wrong, we want to know, so we've passed in an anonymous function which if invoked will receive `err` and throw that error. This callback function is required when registering plugins.

The `server.route`() command registers the `/hello` route, which tells your server to accept GET requests to `/hello` and reply with the contents of the `hello.html` file. We've put the routing callback function inside of registering inert because we need to insure that inert is registered _before_ we use it to render the static page. It is generally wise to run code that depends on a plugin within the callback that registers that plugin so that you can be absolutely sure that plugin exists when your code runs.

Start up your server with `npm start` and go to `http://localhost:3000/hello` in your browser. Oh no! We're getting a 404 error because we never created a `hello.html` file. You need to create the missing file to get rid of this error.

Create a folder called `public` at the root of your directory with a file called `hello.html` within it. Inside `hello.html` put the following HTML: `<h2>Hello World.</h2>`. Then reload the page in your browser. You should see a header reading "Hello World."

Inert will serve whatever content is saved to your hard drive when the request is made, which is what leads to this live reloading behavior. Customize the page at `/hello` to your liking.

More details on how static content is served are detailed on [Serving Static Content](/tutorials/serving-files). This technique is commonly used to serve images, stylesheets, and static pages in your web application.

## Using plugins

A common desire when creating any web application, is an access log. To add some basic logging to our application, let's load the [good](https://github.com/hapijs/good) plugin and its [good-console](https://github.com/hapijs/good-console) reporter on to our server. We'll also need a basic filtering mechanism. Let's use [good-squeeze](https://github.com/hapijs/good-squeeze) because it has the basic event type and tag filtering we need to get started.

Let's install the modules from npm to get started:

```bash
npm install --save good
npm install --save good-console
npm install --save good-squeeze
```

Then update your `server.js`:

```javascript
'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {

        if (err) {
            throw err;
        }

        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
```

Now when the server is started you'll see:

```
140625/143008.751, [log,info], data: Server running at: http://localhost:3000
```

And if we visit `http://localhost:3000/` in the browser, you'll see:

```
140625/143205.774, [response], http://localhost:3000: get / {} 200 (10ms)
```

Great! This is just one short example of what plugins are capable of, for more information check out the [plugins tutorial](/tutorials/plugins).

## Everything else

hapi has many, many other capabilities and only a select few are documented in tutorials here. Please use the list to your right to check them out. Everything else is documented in the [API reference](/api) and, as always, feel free to ask question or just visit us on freenode in [#hapi](http://webchat.freenode.net/?channels=hapi).
