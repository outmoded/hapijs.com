## Getting started

_This tutorial is compatible with hapi v17_

### Installing hapi

Create a new directory `myproject`, and from there:

* Run: `cd myproject` this goes into the created project folder.
* Run: `npm init` and follow the prompts, this will generate a package.json file for you.
* Run: `npm install --save hapi@17.x.x` this installs hapi, and saves it in your package.json as a dependency of your project.

That's it! You now have everything you need in order to create a server using hapi.

### Creating a server

The most basic server looks like the following:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

First, we require hapi. Then we create a new hapi server object with a configuration object containing a host and a port
number to listen on. After that we start the server and log that it's running.

When creating a server, we can also provide a hostname, IP address, or even
a Unix socket file, or Windows named pipe to bind the server to. For more details, see [the API reference](/api/#-server-options).

### Adding routes

Now that we have a server we should add one or two routes so that it actually does something. Let's see what that looks like:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        return 'Hello, ' + encodeURIComponent(request.params.name) + '!';
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

Save the above as `server.js` and start the server with the command `node server.js`. Now you'll find that if you visit [http://localhost:3000](http://localhost:3000) in your browser, you'll see the text `Hello, world!`, and if you visit [http://localhost:3000/stimpy](http://localhost:3000/stimpy) you'll see `Hello, stimpy!`.

Note that we URI encode the name parameter, this is to prevent content injection attacks. Remember, it's never a good idea to render user provided data without output encoding it first!

The `method` parameter can be any valid HTTP method, array of HTTP methods, or an asterisk to allow any method. The `path` parameter defines the path including parameters. It can contain optional parameters, numbered parameters, and even wildcards. For more details, see [the routing tutorial](/tutorials/routing).

### Creating static pages and content

We've proven that we can start a simple hapi app with our Hello World application. Next, we'll use a plugin called **inert** to serve a static page. Before you begin, stop the server with **CTRL + C**.

To install [inert](https://github.com/hapijs/inert) run this command at the command line: `npm install --save inert` This will download [inert](https://github.com/hapijs/inert) and add it to your `package.json`, which documents which packages are installed.

Update the `init` function in your `server.js` file:

``` javascript
const init = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/hello',
        handler: (request, h) => {

            return h.file('./public/hello.html');
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
```

The `server.register()` command above adds the [inert](https://github.com/hapijs/inert) plugin to your hapi application.

The `server.route()` command registers the `/hello` route, which tells your server to accept GET requests to `/hello` and reply with the contents of the `hello.html` file. We've put the route registration after registering the `inert` plugin. It is generally wise to run code that depends on a plugin after the plugin is registered so that you can be absolutely sure that the plugin exists when your code runs.

Start up your server with `node server.js` and go to [`http://localhost:3000/hello`](http://localhost:3000/hello) in your browser. Oh no! We're getting an error because we never created a `hello.html` file. You need to create the missing file to get rid of this error.

Create a folder called `public` at the root of your directory with a file called `hello.html` within it. Inside `hello.html` put the following HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hapi.js is awesome!</title>
  </head>
  <body>
    <h1>Hello World.</h1>
  </body>
</html>
```

This is a simple valid HTML5 document.

Now reload the page in your browser. You should see a header reading "Hello World."

[Inert](https://github.com/hapijs/inert) will serve whatever content is saved to your hard drive when the request is made, which is what leads to this live reloading behavior. Customize the page at `/hello` to your liking.

More details on how static content is served are detailed on [Serving Static Content](/tutorials/serving-files). This technique is commonly used to serve images, stylesheets, and static pages in your web application.

### Using plugins

A common desire when creating any web application, is an access log. To add some basic logging to our application, let's load the [hapi pino](https://github.com/pinojs/hapi-pino) plugin.

Let's install the module from npm to get started:

```bash
npm install hapi-pino
```

Then update your `server.js`:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        // request.log(['a', 'name'], "Request name");
        // or
        request.logger.info('In handler %s', request.path);

        return `Hello, ${encodeURIComponent(request.params.name)}!`;
    }
});

const init = async () => {

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: ['response', 'onPostStart']
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

```

Now when the server is started you'll see something like:

```sh
[2017-12-03T17:15:45.114Z] INFO (10412 on box): server started
    created: 1512321345014
    started: 1512321345092
    host: "localhost"
    port: 3000
    protocol: "http"
    id: "box:10412:jar12y2e"
    uri: "http://localhost:3000"
    address: "127.0.0.1"
```

And if we visit [http://localhost:3000/](http://localhost:3000/) in the browser, we can see that logs about the request are being printed in the terminal.

The behavior of the logger is configured in `options` passed to the register function.

Great! This is just one short example of what plugins are capable of, for more information check out the [plugins tutorial](/tutorials/plugins).

### Everything else

hapi has many, many other capabilities and only a select few are documented in tutorials here. Please use the list to your right to check them out. Everything else is documented in the [API reference](/api) and, as always, feel free to ask questions on [github](https://github.com/hapijs/discuss/issues) and [gitter](https://gitter.im/hapijs/hapi) or just visit us on [slack](https://join.slack.com/t/hapihour/shared_invite/enQtMjM5Njk1NDgzNTY5LThmODkxODIzOTg5NjJjODFiYjcxZDMxMTAyMzBkZDk3MWY4MTFlNDAyMTU3MmUwMmM0Y2UwMjU3YjAwYjRkN2E).
