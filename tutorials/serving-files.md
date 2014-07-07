# Serving static files
## Serving static files

Inevitably while building any web application, the need arises to serve a simple file from disk. hapi provides a pair of built-in handlers, as well as a reply method, to make doing so very simple.

## reply.file()

First, to use the reply method:

```javascript
server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: function (request, reply) {
        reply.file('/path/to/picture.jpg');
    }
});
```

As I'm sure you've guessed, in its simplest form you pass a path to `reply.file()` and you're done.

### Relative paths

To simplify things, especially if you have multiple routes that respond with files, you can configure a base path in your server and only pass relative paths to `reply.file()`

```javascript
var Path = require('path');
var Hapi = require('hapi');

var server = new Hapi.Server('localhost', 3000, { files: { relativeTo: Path.join(__dirname, 'public') } });

server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: function (request, reply) {
        reply.file('picture.jpg');
    }
});
```

## File handler

An alternative to the above route would be to use the built-in `file` handler:

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

We can also specify the parameter as a function that accepts the `request` object and returns a string representing the file's path:

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
    path: '/picture.jpg',
    handler: {
        file: {
            path: 'picture.jpg',
            filename: 'banana.jpg', // override the filename in the Content-Disposition header
            mode: 'attachment', // specify the Content-Disposition is an attachment
            lookupCompressed: true // allow looking for picture.jpg.gz if the request allows it
        }
    }
});
```

## Directory handler

In addition to the `file` handler, there is also a `directory` handler that allows you to specify one route to serve multiple files. In order to use it, you must specify a path with a parameter. The name of the parameter does not matter, however. You can use the asterisk extension on the parameter to restrict file depth as well. The most basic usage of the directory handler looks like:

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

Now a request to `/` will reply with HTML showing the contents of the directory. We can take this static server one step further by also setting the `index` option to `true`, which means that a request to `/` will first attempt to load `/index.html`. This gives us a very simple basic static web server in one route.

When using the directory handler with listing enabled, by default hidden files will not be shown in the listing. That can be changed by setting the `showHidden` option to `true`. Like the file handler, the directory handler also has a `lookupCompressed` option to serve precompressed files when possible. You can also set a `defaultExtension` that will be appended to requests if the original path is not found. This means that a request for `/bacon` will also try the file `/bacon.html`.
