## Views

hapi has extensive support for template rendering, including the ability to load and leverage multiple templating engines, partials, helpers (functions used in templates to manipulate data), and layouts.

## Configuring the server

To get started with views, first we have to configure at least one templating engine on the server. This is done by using the `server.views` method:

```javascript
var Path = require('path');
var Hapi = require('hapi');

var server = new Hapi.Server();
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
- `relativeTo`: used as a prefix for other path types, if specified other paths can be relative to this directory

Additionally, there are two settings that alter how hapi will allow you to use paths. By default, absolute paths and traversing outside of the `path` directory is not allowed. This behavior can be changed by setting the `allowAbsolutePaths` and `allowInsecureAccess` settings to true.

For example, if you have a directory structure like:

```
views\
  index.html
  layout\
    layout.html
  helpers\
    getUser.js
    fortune.js
```

Your configuration might look like:

```javascript
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
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

The simplest way to achieve this is by using the `context` option when calling `server.views()`:

```javascript
var defaultContext = {
    title: 'My personal site'
};

server.views({
    engines: {
        'html': {
            module: require('handlebars'),
            compileMode: 'sync' // engine specific
        }
    },
    context: defaultContext
});
```

The default global context will be merged with any local context passed taking the lowest precedence and applied to your view.

### View helpers

JavaScript modules located in the defined `helpersPath` are available in templates.
For this example, we will create a view helper `fortune` which will pick and print out one element out of an array of strings, when used in a template.

The following snippet is the complete helper function which we will store in a file called `fortune.js` in the `helpers` directory (as defined earlier as the `helpersPath`).

```javascript
module.exports = function() {
  var fortunes = [
    "Reality is that which, when you stop believing in it,
     doesn't go away",
    "Those who believe in astrology are living in houses
     with foundations of Silly Putty.",
    "Drinking is not a spectator sport.",
    "If God had really intended men to fly, he'd make it
     easier to get to the airport.",
    "I don't want to be young again, I just don't want
     to get any older."
  ];
  var x = Math.floor(Math.random() * fortunes.length);
  return fortunes[x];
};
```

Now we can use the view helper in our templates. Here's a code snippet that show's the helper function in [templates/index.html](https://github.com/manonthemat/hapi-view-helpers-doc/blob/master/templates/index.html) using handlebars as a rendering engine:

```html
<h1>Your fortune</h1>
<p>{{fortune}}</p>
```

Now when we start the [server](https://github.com/manonthemat/hapi-view-helpers-doc/blob/master/server.js) and point our browser to the route which uses our template (which uses our view helper), we should see a paragraph with a randomly selected fortune right below the header.

For the complete source code, visit [view helpers example project](https://github.com/manonthemat/hapi-view-helpers-doc)
