# Views
## Views

hapi has extensive support for template rendering, including the ability to load and leverage multiple templating engines, partials, helpers (functions used in templates to manipulate data), and layouts.

## Configuring the server

To get started with views, first we have to configure at least one templating engine on the server. This is done by using the `server.views` method:

```javascript
var Path = require('path');
var Hapi = require('hapi');

var server = new Hapi.Server(3000);
server.views({
    engines: {
        html: require('handlebars')
    },
    path: Path.join(__dirname, 'templates')
});

```

We're doing several things here.

First, we register the `handlebars` module as the engine responsible for rendering templates with an extension of `.html`.

Second, we tell the server that our templates are located in the `templates` directory within the current path. By default, hapi will look for templates in the current working directory. You can set the path parameter to wherever your templates are located.

### View options

There are many options available to the views engine in hapi. Full documentation can be found in the [API reference](/api/#server-options), but we'll go over some of them here as well.

Note that all options may be set either globally, which configures them for all registered engines, or local to one specific engine, for example:

```javascript
server.views({
    engines: {
        'html': {
            module: require('handlebars'),
            compileMode: 'sync' // engine specific
        }
    },
    compileMode: 'async' // global setting
});
```

#### Engines

In order to use views in hapi, you must register at least one templating engine with the server. Templating engines may be either synchronous, or asynchronous, and should be an object with an export named `compile`.

The signature of the `compile` method for synchronous engines is `function (template, options)` and that method should return a function with the signature `function (context, options)` which should either throw an error, or return the compiled html.

Asynchronous template engines should have a `compile` method with the signature `function (template, options, callback)` which calls `callback` in standard error first format and returns a new method with the signature `function (context, options, callback)`. The returned method should also call `callback` in error first format, with the compiled html being the second parameter.

By default, hapi assumes that template engines are synchronous (i.e. `compileMode` defaults to `sync`), to use an asynchronous engine you must set `compileMode` to `async`.

Leveraging the `options` parameter in both the `compile` method, and the method it returns, is done via the `compileOptions` and `runtimeOptions` settings. Both of these options default to the empty object `{}`.

`compileOptions` is the object passed as the second parameter to `compile`, while `runtimeOptions` is passed to the method that `compile` returns.

If only one templating engine is registered, it automatically becomes the default allowing you to leave off the file extension when requesting a view. However, if more than one engine is registered, you must either append the file extension, or set the `defaultExtension` to the engine you use most frequently. For any views that do not use the default engine, you'll still need to specify a file extension.

Another useful options is `isCached`. If set to `false`, hapi will not cache the result of templates and will instead read the template from file on each use. When developing your application, this can be very handy as it prevents you from having to restart your app while working on templates. It is recommended that you leave `isCached` to its default value of `true` in production, however.

#### Paths

Since views can have files in several different locations, hapi allows you to configure several paths to help find things. Those options are:

- `path`: the directory that contains your main templates
- `partialsPath`: the directory that contains your partials
- `helpersPath`: the directory that contains your template helpers
- `layoutPath`: the directory that contains layout templates
- `basePath`: used as a prefix for other path types, if specified other paths can be relative to this directory

Additionally, there are two settings that alter how hapi will allow you to use paths. By default, absolute paths and traversing outside of the `path` directory is not allowed. This behavior can be changed by setting the `allowAbsolutePaths` and `allowInsecureAccess` settings to true.

For example, if you have a directory structure like:

```
views\
  index.html
  layout\
    layout.html
  helpers\
    getUser.js
```

Your configuration might look like:

```javascript
server.views({
    engines: {
        html: require('handlebars')
    },
    basePath: __dirname,
    path: './views',
    layoutPath: './views/layout',
    helpersPath: './views/helpers'
});
```

## Rendering a view

There are two options for rendering a view, you can use either the `reply.view()` interface, or the view handler.

### `reply.view()`

The first method of rendering a view we'll look at is `reply.view()`. Here's what a route using this method would look like:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.view('index');
    }
});
```

In order to pass context to `reply.view()`, you pass an object as the second parameter, for example:

```javascript
reply.view('index', { title: 'My home page' });
```

If you are using layouts, hapi will add a special context property called `content`. The `content` property contains the rendered HTML of the template so should be used with triple braces in your layout:

```javascript
reply.view('index', { title: 'My home page' }, { layout: 'homepageLayout' });
```

```html
<html>
    <head>
        <title>{{title}}</title>
    </head>
    <body>
        {{{content}}}
    </body>
</html>
```

### View handler

The second method of rendering a view, is using hapi's built in view handler. That route would look like:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: 'index'
    }
});
```

When using the view handler, context is passed in the key `context`, for example:

```javascript
handler: {
    view: {
        template: 'index',
        context: {
            title: 'My home page'
        }
    }
}
```

### Global context

We've seen how to pass context directly to a view, but what if we have some default context that should *always* be available on all templates?

The simplest way to achieve this is by using an `onPreResponse` handler on your server, that looks like the following:

```javascript
var defaultContext = {
    title: 'My personal site'
};

server.ext('onPreResponse', function (request, reply) {
    if (request.response.variety === 'view') { 
        request.response.source.context = Hoek.applyToDefaults(defaultContext, request.response.source.context);
    }

    reply();
});
```

What this does is check the `response` type to make sure it's a view, since we don't want to modify requests that aren't.

Then, we use [Hoek](https://github.com/hapijs/hoek)'s `applyToDefaults` method to apply the context given explicitly to this view on top of the default context object we defined at the top level.
