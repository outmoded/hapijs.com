## Plugins

hapi has an extensive and powerful plugin system that allows you to very easily break your application up into isolated pieces of business logic, and reusable utilities.

## Creating a plugin

Plugins are very simple to write. At their core they are an object with a `register` function that has the signature `function (server, options, next)`. That `register` function then has an `attributes` object attached to it to provide hapi with some additional information about the plugin, such as name and version.

A very simple plugin looks like:

```javascript
var myPlugin = {
    register: function (server, options, next) {
        next();
    }
}

myPlugin.register.attributes = {
    name: 'myPlugin',
    version: '1.0.0'
};
```

Or when written as an external module:

```javascript
exports.register = function (server, options, next) {
    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
```

Note that in the first example, we set the `name` and `version` attributes specifically, however in the second we set a `pkg` parameter with the contents of package.json as its value. Either method is acceptable.

Additionally, the `attributes` object may contain the key `multiple` that when set to `true` tells hapi that it is safe to register your plugin more than once in the same server.

### The register method

As we've seen above, the `register` method accepts three parameters, `server`, `options`, and `next`.

The `options` parameter is simply whatever options the user passes to your plugin. No changes are made and the object is passed directly to your `register` method.

`next` is a method to be called when your plugin has completed whatever steps are necessary for it to be registered. This method accepts only one parameter, `err`, that should only be defined if an error occurred while registering your plugin.

The `server` object is a reference to the `server` your plugin is being loaded in.

#### `server.select()`

Servers can have connections added with a label assigned to them:

```javascript
var server = new Hapi.Server();
server.connection({ labels: ['api'] });
```

This label can then be used to apply plugins and other settings only to specific connections by using the `server.select()` method.

For example, to add a route only to connections with a label of `'api'`, you would use:

```javascript
var api = server.select('api');

api.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('api index');
    }
});
```

Multiple labels can be selected at the same time by passing an array of strings, this works as a logical OR statement. To accomplish a logical AND, you can chain calls to `server.select()` like so:

```javascript
// all servers with a label of backend OR api
var myServers = server.select(['backend', 'api']);

// servers with a label of api AND admin
var adminServers = server.select('api').select('admin');
```

The return value of `server.select()` is a server object that contains only the selected connections.

## Loading a plugin

Plugins can be loaded one at a time, or as a group in an array, by the `server.register()` method, for example:

```javascript
// load one plugin
server.register(require('myplugin'), function (err) {
    if (err) {
        console.error('Failed to load plugin:', err);
    }
});

// load multiple plugins
server.register([require('myplugin'), require('yourplugin')], function (err) {
    if (err) {
        console.error('Failed to load a plugin:', err);
    }
});
```

To pass options to your plugin, we instead create an object with `register` and `options` keys, such as:

```javascript
server.register({
    register: require('myplugin'),
    options: {
        message: 'hello'
    }
}, function (err) {
});
```

These objects can also be passed in an array:

```javascript
server.register([{
    register: require('plugin1'),
    options: {}
}, {
    register: require('plugin2'),
    options: {}
}], function (err) {
});
```

### Plugin options

You may also pass an optional parameter to `server.register()` before the callback. Documentation for this object can be found in the [API reference](/api#serverregisterplugins-options-callback).

The options object is used by hapi and is *not* passed to the plugin(s) being loaded. It allows you to pre-select servers based on one or more labels, as well as apply `vhost` or `prefix` modifiers to any routes that your plugins register.

For example, let's say we have a plugin that looks like this:

```javascript
exports.register = function (server, options, next) {
    server.route({
        method: 'GET',
        path: '/test',
        handler: function (request, reply) {
            reply('test passed');
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json');
};
```

Normally, when this plugin is loaded it will create a `GET` route at `/test`. This can be changed by using the `prefix` setting in the options, which will prepend a string to all routes created in the plugin:

```javascript
server.register({register: require('myplugin')}, {
    routes: {
        prefix: '/plugins'
    }
}, function (err) {
});
```

Now when the plugin is loaded, because of the `prefix` option the `GET` route will be created at `/plugins/test`.

Similarly the `config.vhost` parameter will assign a default `vhost` configuration to any routes created by the plugins being loaded. More detail about the `vhost` configuration can be found in the [API reference](/api#route-options).

The `select` parameter works exactly the same way as `server.select()` does, in that you may pass one label or an array of labels for the plugin to be associated with.

```javascript
server.register({register: require('myplugin')}, {
    select: ['webserver', 'admin']
}, function (err) {
});
```

This allows you to attach a plugin to specific connections in a server without having to change the code of the plugin.

