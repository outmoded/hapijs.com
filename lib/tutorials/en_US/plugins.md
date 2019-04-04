## Plugins

_This tutorial is compatible with hapi v17_

hapi has an extensive and powerful plugin system that allows you to very easily break your application up into isolated pieces of business logic, and reusable utilities.

## Creating a plugin

Plugins are very simple to write. At their core they are an object with a `register` property, that is a function with the signature `async function (server, options)`. Additionally the plugin object has a required `name` property and several optional properties including `version`.

A very simple plugin looks like:

```javascript
'use strict';

const myPlugin = {
    name: 'myPlugin',
    version: '1.0.0',
    register: async function (server, options) {

        // Create a route for example

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'hello, world';
            }
        });

        // etc ...
        await someAsyncMethods();
    }
};
```

Or when written as an external module, you can specify a `pkg` property:

```javascript
'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options) {

        // Create a route for example

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'hello, world';
            }
        });

        // etc...
        await someAsyncMethods();
    }
};
```

Note that in the first example, we set the `name` and `version` properties explicitly, however in the second we set a `pkg` parameter with the contents of package.json as its value. Either method is acceptable.

When written as a module, a plugin can either be top-level module export i.e `module.exports = { register, name, version }` or if you want your module to export more than a hapi plugin, it can be exported as `exports.plugin = { register, name, version }`.

Additionally, the plugin object may contain the property `multiple` that when set to `true` tells hapi that it is safe to register your plugin more than once in the same server.

Another available property is `once`. When set to `true` will mean hapi ignores subsequent registers of the same plugin without throwing an error.

### The register method

As we've seen above, the `register` method accepts two parameters, `server` and `options`.

The `options` parameter is simply whatever options the user passes to your plugin when calling `server.register(plugin, options)`. No changes are made and the object is passed directly to your `register` method.

`register` should be an async function that returns once your plugin has completed whatever steps are necessary for it to be registered. Alternatively your register plugin should throw an error if an error occurred while registering your plugin.

The `server` object is a reference to the `server` your plugin is being loaded in.

## Loading a plugin

Plugins can be loaded one at a time, or as a group in an array, by the `server.register()` method, for example:

```javascript
const start = async function () {

    // load one plugin

    await server.register(require('myplugin'));

    // load multiple plugins

    await server.register([require('myplugin'), require('yourplugin')]);
};
```

To pass options to your plugin, we instead pass an object with `plugin` and `options` keys, such as:

```javascript
const start = async function () {

    await server.register({
        plugin: require('myplugin'),
        options: {
            message: 'hello'
        }
    });
};
```

These objects can also be passed in an array:

```javascript
const start = async function () {

    await server.register([{
        plugin: require('plugin1'),
        options: {}
    }, {
        plugin: require('plugin2'),
        options: {}
    }]);
};
```

### Registration options

You may also pass a second optional parameter to `server.register()`. Documentation for this object can be found in the [API reference](/api#-await-serverregisterplugins-options).

The options object is used by hapi and is *not* passed to the plugin(s) being loaded. It allows you to apply `vhost` or `prefix` modifiers to any routes that your plugins register.

For example, let's say we have a plugin that looks like this:

```javascript
'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options) {

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'test passed';
            }
        });

        // etc...
        await someAsyncMethods();
    }
};
```

Normally, when this plugin is loaded it will create a `GET` route at `/test`. This can be changed by using the `prefix` setting in the options, which will prepend a string to all routes created in the plugin:

```javascript
const start = async function (server) {

    await server.register(require('myplugin'), {
        routes: {
            prefix: '/plugins'
        }
    });
};
```

Now when the plugin is loaded, because of the `prefix` option the `GET` route will be created at `/plugins/test`.

Similarly the `options.routes.vhost` property will assign a default `vhost` configuration to any routes created by the plugins being loaded. More detail about the `vhost` configuration can be found in the [API reference](/api#-serverrouteroute).
