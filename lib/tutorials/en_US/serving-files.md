## Serving static files

_This tutorial is compatible with hapi v17_

Inevitably while building any web application, the need arises to serve a simple file from disk. There's a hapi plugin called [inert](https://github.com/hapijs/inert) that adds this functionality to hapi through the use of additional handlers.

First you need to install and add inert as a dependency to your project:

`npm install --save inert`

## `h.file(path, [options])`

Firstly, let's see how to use the [`h.file()`](https://github.com/hapijs/inert#hfilepath-options) method:

```javascript
const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('/path/to/picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

As you can see above, in its most basic form you return `h.file(path)`.

### Relative paths

To simplify things, especially if you have multiple routes that respond with files, you can configure a base path in your server and only pass relative paths to `h.file()`:

```javascript
'use strict';

const Hapi = require('hapi');
const Path = require('path');

const server = Hapi.server({
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
});

const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

When you set an option under `server.options.routes`, such as above, it will apply to _all_ routes. You can also set these options, including the `relativeTo` option on a per-route level.

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

In addition to the `file` handler, inert also adds a `directory` handler that allows you to specify one route to serve multiple files. In order to use it, you must specify a route path with a parameter. The name of the parameter does not matter, however. You can use the asterisk extension on the parameter to restrict file depth as well. The most basic usage of the directory handler looks like:

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

The above route will respond to any request by looking for a matching filename in the `public` directory. Note that a request to `/` in this configuration will reply with an HTTP `403` response. We can fix this by adding an index file. By default hapi will search in the directory for a file called `index.html`. We can disable serving an index file by setting the index option to `false`, or alternatively we can specify an array of files that inert should look for as index files:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            index: ['index.html', 'default.html']
        }
    }
});
```

A request to `/` will now first try to load `/index.html`, then `/default.html`. When there is no index file available, inert can display the contents of the directory as a listing page. You can enable that by setting the `listing` property to `true` like so:

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
Now a request to `/` will reply with HTML showing the contents of the directory.  When using the directory handler with listing enabled, by default hidden files will not be shown in the listing. That can be changed by setting the `showHidden` option to `true`. Like the file handler, the directory handler also has a `lookupCompressed` option to serve precompressed files when possible. You can also set a `defaultExtension` that will be appended to requests if the original path is not found. This means that a request for `/bacon` will also try the file `/bacon.html`.
