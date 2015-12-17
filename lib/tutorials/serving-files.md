## Serving static files

_This tutorial is compatible with hapi v11.x.x._

Inevitably while building any web application, the need arises to serve a simple file from disk. There's a hapi plugin called [inert](https://github.com/hapijs/inert) that adds this functionality to hapi through the use of additional handlers.

First you need to install and add inert as a dependency to your project:

`npm install --save inert`

## reply.file()

First, to use the reply method:

```javascript
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, reply) {
            reply.file('/path/to/picture.jpg');
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('Server running at:', server.info.uri);
    });
});
```

As I'm sure you've guessed, in its simplest form you pass a path to `reply.file()` and you're done.

### Relative paths

To simplify things, especially if you have multiple routes that respond with files, you can configure a base path in your server and only pass relative paths to `reply.file()`

```javascript
'use strict';

const Path = require('path');
const Hapi = require('hapi');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, reply) {
            reply.file('path/to/picture.jpg');
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('Server running at:', server.info.uri);
    });
});
```

As you may have guessed by the option passed to the server, the `relativeTo` parameter can also be set on a per-connection or per-route level.

## File handler

An alternative to the above route would be to use the `file` handler:

```javascript
server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: {
        file: 'picture.jpg'
    }
});
```

### File handler options

We can also specify the parameter as a function that accepts the `request` object and returns a string representing the file's path (absolute or relative):

```javascript
server.route({
    method: 'GET',
    path: '/{filename}',
    handler: {
        file: function (request) {
            return request.params.filename;
        }
    }
});
```

It can also be an object with a `path` property. When using the object form of the handler, we can do a few additional things, like setting the `Content-Disposition` header and allowing compressed files like so:

```javascript
server.route({
    method: 'GET',
    path: '/script.js',
    handler: {
        file: {
            path: 'script.js',
            filename: 'client.js', // override the filename in the Content-Disposition header
            mode: 'attachment', // specify the Content-Disposition is an attachment
            lookupCompressed: true // allow looking for script.js.gz if the request allows it
        }
    }
});
```

## Directory handler

In addition to the `file` handler, inert also adds a `directory` handler that allows you to specify one route to serve multiple files. In order to use it, you must specify a path with a parameter. The name of the parameter does not matter, however. You can use the asterisk extension on the parameter to restrict file depth as well. The most basic usage of the directory handler looks like:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});
```

### Directory handler options

The above route will respond to any request by looking for a matching filename in the `public` directory. Note that a request to `/` in this configuration will reply with an HTTP `403` because by default the handler will not allow file listing. You can change that by setting the `listing` property to `true` like so:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: true
        }
    }
});
```

Now a request to `/` will reply with HTML showing the contents of the directory. We can take this static server one step further by also setting the `index` option to `true`, which means that a request to `/` will first attempt to load `/index.html`. The `index` option also accepts a string or array of strings to specify the default file(s) to load. By setting the `index` option to `['index.html', 'default.html']`, a request to `/` will first try to load `/index.html`, then `/default.html`. This gives us a very simple basic static web server in one route.

When using the directory handler with listing enabled, by default hidden files will not be shown in the listing. That can be changed by setting the `showHidden` option to `true`. Like the file handler, the directory handler also has a `lookupCompressed` option to serve precompressed files when possible. You can also set a `defaultExtension` that will be appended to requests if the original path is not found. This means that a request for `/bacon` will also try the file `/bacon.html`.
