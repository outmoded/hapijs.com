# Views

_This tutorial is compatible with hapi v17_

- [Overview](#overview)
- [Vision](#vision)
- [Configuring the Server](#server)
- [server.views() Options](#options)
    - [Engines](#engines)
    - [Paths](#paths)
    - [Global Context](#global)
    - [View helpers](#helpers)
    - [Layouts](#layouts)
- [Rendering a View](#render)
    - [h.view()](#hview)
    - [View handler](#viewhandler)


## <a name="overview" /> Overview

hapi has extensive support for template rendering, including the ability to load and leverage multiple templating engines, partials, helpers (functions used in templates to manipulate data), and layouts. These capabilities are provided by the [vision](https://github.com/hapijs/vision) plugin.

## <a name="vision" /> Vision

[Vision](https://github.com/hapijs/vision) is a templates rendering plugin for hapi.js. `Vision` decorates the `server`, `request`, and `h` response toolkit interfaces with additional methods for managing view engines that can be used to render templated responses. `Vision` also provides a built-in handler implementation for creating templated responses.  

`Vision` is compatible with most major templating engines out of the box, such as ejs, handlebars, pug, twig, etc. Engines that don't follow the normal API pattern can still be used by mapping their API to the [vision API](https://github.com/hapijs/vision/blob/master/API.md).

For more info, please see [here](https://github.com/hapijs/vision).

## <a name="server" /> Configuring the server

To get started with views, first we have to configure at least one templating engine on the server. This is done by using the [`server.views()`](https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions) method provided by `vision`:

```javascript
'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');

const start = async () => {

    const server = Hapi.server();

    await server.register(require('vision'));

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates'
    });
};

start();
```

We're doing several things here. First, we load the [vision](https://github.com/hapijs/vision) module as a plugin. It adds template rendering support to hapi.

Secondly, we register the `handlebars` module as the engine responsible for rendering templates with an extension of `.html`.

Next, we tell the server that our templates are located in the `templates` directory. We indicate that this directory should be taken relative to the current directory by providing a `relativeTo` option. By default, hapi will look for templates relative to the current working directory.

## <a name="options" /> server.views() Options

There are many options available to the views engine in hapi. Full documentation can be found in the [vision API reference](https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions), but we'll go over some of them here as well.

Note that all options may be set either globally, which configures them for all registered engines, or local to one specific engine, for example:

```javascript
server.views({
    engines: {
        html: {
            module: require('handlebars'),
            compileMode: 'sync' // engine specific
        }
    },
    compileMode: 'async' // global setting
});
```

### <a name="engines" /> Engines

In order to use views in hapi, you must register at least one templating engine with the server. Templating engines may be either synchronous, or asynchronous, and should be an object with an export named `compile`.

The signature of the `compile` method for synchronous engines is `function (template, options)` and that method should return a function with the signature `function (context, options)` which should either throw an error, or return the compiled html.

Asynchronous template engines should have a `compile` method with the signature `function (template, options, callback)` which calls `callback` in standard error first format and returns a new method with the signature `function (context, options, callback)`. The returned method should also call `callback` in error first format, with the compiled html being the second parameter.

By default, hapi assumes that template engines are synchronous (i.e. `compileMode` defaults to `sync`), to use an asynchronous engine you must set `compileMode` to `async`.

Leveraging the `options` parameter in both the `compile` method, and the method it returns, is done via the `compileOptions` and `runtimeOptions` settings. Both of these options default to the empty object `{}`.

`compileOptions` is the object passed as the second parameter to `compile`, while `runtimeOptions` is passed to the method that `compile` returns.

If only one templating engine is registered, it automatically becomes the default allowing you to leave off the file extension when requesting a view. However, if more than one engine is registered, you must either append the file extension, or set the `defaultExtension` to the engine you use most frequently. For any views that do not use the default engine, you'll still need to specify a file extension.

Another useful options is `isCached`. If set to `false`, hapi will not cache the result of templates and will instead read the template from file on each use. When developing your application, this can be very handy as it prevents you from having to restart your app while working on templates. It is recommended that you leave `isCached` to its default value of `true` in production, however.

### <a name="paths" /> Paths

Since views can have files in several different locations, hapi allows you to configure several paths to help find things. Those options are:

- `path`: the directory that contains your main templates
- `partialsPath`: the directory that contains your partials
- `helpersPath`: the directory that contains your template helpers
- `layoutPath`: the directory that contains layout templates
- `relativeTo`: used as a prefix for other path types, if specified other paths can be relative to this directory

Additionally, there are two settings that alter how hapi will allow you to use paths. By default, absolute paths and traversing outside of the `path` directory is not allowed. This behavior can be changed by setting the `allowAbsolutePaths` and `allowInsecureAccess` settings to true.

For example, if you have a directory structure like:

```
templates\
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
    path: './templates',
    layoutPath: './templates/layout',
    helpersPath: './templates/helpers'
});
```

### <a name="global" /> Global context

In the [rendering a view](#render) tutorial, we see how to pass context directly into a view, but what if we have some default context that should *always* be available on all templates?

The simplest way to achieve this is by using the `context` option when calling `server.views()`:

```javascript
const context = {
    title: 'My personal site'
};

server.views({
    engines: {
        html: {
            module: require('handlebars'),
            compileMode: 'sync' // engine specific
        }
    },
    context
});
```

The default global context will be merged with any local context passed taking the lowest precedence and applied to your view.

### <a name="helpers" /> View helpers

JavaScript modules located in the defined `helpersPath` are available in templates. For this example, we will create a view helper `fortune` which will pick and print out one element out of an array of strings, when used in a template.

The following snippet is the complete helper function which we will store in a file called `fortune.js` in the `helpers` directory.

```javascript
module.exports = function () {

    const fortunes = [
        'Heisenberg may have slept here...',
        'Wanna buy a duck?',
        'Say no, then negotiate.',
        'Time and tide wait for no man.',
        'To teach is to learn.',
        'Never ask the barber if you need a haircut.',
        'You will forget that you ever knew me.',
        'You will be run over by a beer truck.',
        'Fortune favors the lucky.',
        'Have a nice day!'
    ];

    const x = Math.floor(Math.random() * fortunes.length);
    return fortunes[x];
};
```

Now we can use the view helper in our templates. Here's a code snippet that show's the helper function in `templates/index.html` using handlebars as a rendering engine:

```html
<h1>Your fortune</h1>
<p>{{fortune}}</p>
```

Now when we start the server and point our browser to the route which uses our template (which uses our view helper), we should see a paragraph with a randomly selected fortune right below the header.

For reference, here is a complete server script that uses the fortune view helper method in a template.

```javascript
'use strict';

const Hapi = require('hapi');

const start = async () => {

    const server = Hapi.server({ port: 8080 });

    await server.register(require('vision'));

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates',
        helpersPath: 'helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return h.view('index');
        }
    });
};

start();
```

### <a name="layouts" /> Layouts

`Vision` includes built-in support for view layouts. It comes disabled by default, because it may conflict with other layout systems that specific view engines may provide. We recommend choosing only one layout system.

In order to use the built-in layout system, first setup the view engine:

```javascript
server.views({
    // ...
    layout: true,
    layoutPath: 'templates/layout'
});
```

This enables the built-in layouts and defines the default layout page to `templates/layout/layout.html` (or whatever other extension you're using).

Setup a content area in your `layout.html`:

```html
<html>
  <body>
    {{{content}}}
 </body>
</html>
```

And your view should be just the content:

```html
<div>Content</div>
```

When rendering the view, the `{{{content}}}` will be replaced by the view contents.

If you want a different default layout, you can set the option globally:

```javascript
server.views({
    // ...
    layout: 'another_default'
});
```

You can also specify a different layout per view:

```javascript
return h.view('myview', null, { layout: 'another_layout' });
```

## <a name="render" /> Rendering a view

There are two options for rendering a view, you can use either the [`h.view()`](https://github.com/hapijs/vision/blob/master/API.md#hviewtemplate-context-options) method, where `h` is the [response toolkit](/api#response-toolkit) or the view handler.

### <a name="hview" /> h.view()

The first method of rendering a view we'll look at is `h.view()`. Here's what a route using this method would look like:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return h.view('index');
    }
});
```

In order to pass context to `h.view()`, you pass an object as the second parameter, for example:

```javascript
return h.view('index', { title: 'My home page' });
```

### <a name="viewhandler" /> View handler

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

```json5
handler: {
    view: {
        template: 'index',
        context: {
            title: 'My home page'
        }
    }
}
```
