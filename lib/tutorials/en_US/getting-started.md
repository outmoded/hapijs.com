## Installing hapi

_This tutorial is compatible with hapi v17.x.x._

Create a new directory `myproject`, and from there:

* Run: `npm init` and follow the prompts, this will generate a package.json file for you.
* Run: `cd myproject` this goes into the created project folder.
* Run: `npm install --save hapi@17.x.x` this installs hapi, and saves it in your package.json as a dependency of your project.

That's it! You now have everything you need in order to create a server using hapi.

## Creating a server

The most basic server looks like the following:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({ port: 3000, host: 'localhost' });

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

init().catch(console.error);

```

First, we require hapi. Then we create a new hapi server object with a configuration object containing a host and a port
number to listen on. After that we start the server and log that it's running.

When creating a server, we can also provide a hostname, IP address, or even
a Unix socket file, or Windows named pipe to bind the server to. For more details, see [the API reference](/api/#server.options).

## Adding routes

Now that we have a server we should add one or two routes so that it actually does something. Let's see what that looks like:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({ port: 3000, host: 'localhost' });

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
        return `Hello, ${encodeURIComponent(request.params.name)}!`;
    }
});

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
}

init().catch(console.error);
```

Save the above as `server.js` and start the server with the command `node server.js`. Now you'll find that if you visit [http://localhost:3000](http://localhost:3000) in your browser, you'll see the text `Hello, world!`, and if you visit [http://localhost:3000/stimpy](http://localhost:3000/stimpy) you'll see `Hello, stimpy!`.

Note that we URI encode the name parameter, this is to prevent content injection attacks. Remember, it's never a good idea to render user provided data without output encoding it first!

The `method` parameter can be any valid HTTP method, array of HTTP methods, or an asterisk to allow any method. The `path` parameter defines the path including parameters. It can contain optional parameters, numbered parameters, and even wildcards. For more details, see [the routing tutorial](/tutorials/routing).

## Creating static pages and content

We've proven that we can start a simple Hapi app with our Hello World application. Next, we'll use a plugin called **inert** to serve a static page. Before you begin, stop the server with **CTRL + C**.

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
}

```

The `server.register()` command above adds the [inert](https://github.com/hapijs/inert) plugin to your Hapi application. If something goes wrong, we want to know, so we've added a `try catch` that will receive any errors. It is recommended to always add a catch when working with promises to prevent errors from being swallowed.

The `server.route`() command registers the `/hello` route, which tells your server to accept GET requests to `/hello` and reply with the contents of the `hello.html` file.

Start up your server with `npm start` and go to [`http://localhost:3000/hello`](http://localhost:3000/hello) in your browser. Oh no! We're getting an error because we never created a `hello.html` file. You need to create the missing file to get rid of this error.

Create a folder called `public` at the root of your directory with a file called `hello.html` within it. Inside `hello.html` put the following HTML: `<h2>Hello World.</h2>`. Then reload the page in your browser. You should see a header reading "Hello World."

[Inert](https://github.com/hapijs/inert) will serve whatever content is saved to your hard drive when the request is made, which is what leads to this live reloading behavior. Customize the page at `/hello` to your liking.

More details on how static content is served are detailed on [Serving Static Content](/tutorials/serving-files). This technique is commonly used to serve images, stylesheets, and static pages in your web application.

## Using plugins

We just saw how to use a plugin in the previous section. We used the `Inert` plugin to help with serving files from disk.

This is just one short example of what plugins are capable of, for more information check out the [plugins tutorial](/tutorials/plugins).

## Everything else

hapi has many, many other capabilities and only a select few are documented in tutorials here. Please use the list to your right to check them out. Everything else is documented in the [API reference](/api) and, as always, feel free to ask questions on [github](https://github.com/hapijs/discuss/issues) and [gitter](gitter.im/hapijs/hapi) or just visit us on [slack](https://t.co/RLLcGIGmRZ).
