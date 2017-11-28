## Authentication

_This tutorial is compatible with hapi v16_

Authentication within hapi is based on the concept of `schemes` and `strategies`.

Think of a scheme as a general type of auth, like "basic" or "digest". A strategy on the other hand, is a pre-configured and named instance of a scheme.

First, let's look at an example of how to use [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic):

```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({ port: 3000 });

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, { id: user.id, name: user.name });
    });
};

server.register(Basic, (err) => {

    if (err) {
        throw err;
    }

    server.auth.strategy('simple', 'basic', { validateFunc: validate });
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hello, ' + request.auth.credentials.name);
            }
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('server running at: ' + server.info.uri);
    });
});
```

First, we define our `users` database, which is a simple object in this example. Then we define a validation function, which is a feature specific to [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic) and allows us to verify that the user has provided valid credentials.

Next, we register the plugin, which creates a scheme with the name of `basic`. This is done within the plugin via [server.auth.scheme()](/api#serverauthschemename-scheme).

Once the plugin has been registered, we use [server.auth.strategy()](/api#serverauthstrategyname-scheme-mode-options) to create a strategy with the name of `simple` that refers to our scheme named `basic`. We also pass an options object that gets passed to the scheme and allows us to configure its behavior.

The last thing we do is tell a route to use the strategy named `simple` for authentication.

## Schemes

A `scheme` is a method with the signature `function (server, options)`. The `server` parameter is a reference to the server the scheme is being added to, while the `options` parameter is the configuration object provided when registering a strategy that uses this scheme.

This method must return an object with *at least* the key `authenticate`. Other optional methods that can be used are `payload` and `response`.

### `authenticate`

The `authenticate` method has a signature of `function (request, reply)`, and is the only *required* method in a scheme.

In this context, `request` is the `request` object created by the server. It is the same object that becomes available in a route handler, and is documented in the [API reference](/api#request-object).

`reply` is the standard hapi `reply` interface, it accepts `err` and `result` parameters in that order.

If `err` is a non-null value, this indicates a failure in authentication and the error will be used as a reply to the end user. It is advisable to use [boom](https://github.com/hapijs/boom) to create this error to make it simple to provide the appropriate status code and message.

The `result` parameter should be an object, though the object itself as well as all of its keys are optional if an `err` is provided.

If you would like to provide more detail in the case of a failure, the `result` object must have a `credentials` property which is an object representing the authenticated user (or the credentials the user attempted to authenticate with) and should be called like `reply(error, null, result);`.

When authentication is successful, you must call `reply.continue(result)` where result is an object with a `credentials` property.

Additionally, you may also have an `artifacts` key, which can contain any authentication related data that is not part of the user's credentials.

The `credentials` and `artifacts` properties can be accessed later (in a route handler, for example) as part of the `request.auth` object.

### `payload`

The `payload` method has the signature `function (request, reply)`.

Again, the standard hapi `reply` interface is available here. To signal a failure call `reply(error, result)` or simply `reply(error)` (again, recommended to use [boom](https://github.com/hapijs/boom)) for errors.

To signal a successful authentication, call `reply.continue()` with no parameters.

### `response`

The `response` method also has the signature `function (request, reply)` and utilizes the standard `reply` interface.

This method is intended to decorate the response object (`request.response`) with additional headers, before the response is sent to the user.

Once any decoration is complete, you must call `reply.continue()`, and the response will be sent.

If an error occurs, you should instead call `reply(error)` where `error` is recommended to be a [boom](https://github.com/hapijs/boom).

### Registration

To register a scheme, use either `server.auth.scheme(name, scheme)`. The `name` parameter is a string used to identify this specific scheme, the `scheme` parameter is a method as described above.

## Strategies

Once you've registered your scheme, you need a way to use it. This is where strategies come in.

As mentioned above, a strategy is essentially a pre-configured copy of a scheme.

To register a strategy, we must first have a scheme registered. Once that's complete, use `server.auth.strategy(name, scheme, [mode], [options])` to register your strategy.

The `name` parameter must be a string, and will be used later to identify this specific strategy. `scheme` is also a string, and is the name of the scheme this strategy is to be an instance of.

### Mode

`mode` is the first optional parameter, and may be either `true`, `false`, `'required'`, `'optional'`, or `'try'`.

The default mode is `false`, which means that the strategy will be registered but not applied anywhere until you do so manually.

If set to `true` or `'required'`, which are the same, the strategy will be automatically assigned to all routes that don't contain an `auth` config. This setting means that in order to access the route, the user must be authenticated, and their authentication must be valid, otherwise they will receive an error.

If mode is set to `'optional'` the strategy will still be applied to all routes lacking `auth` config, but in this case the user does *not* need to be authenticated. Authentication data is optional, but must be valid if provided.

The last mode setting is `'try'` which, again, applies to all routes lacking an `auth` config. The difference between `'try'` and `'optional'` is that with `'try'` invalid authentication is accepted, and the user will still reach the route handler.

### Options

The final optional parameter is `options`, which will be passed directly to the named scheme.

### Setting a default strategy

As previously mentioned, the `mode` parameter can be used with `server.auth.strategy()` to set a default strategy. You may also set a default strategy explicitly by using `server.auth.default()`.

This method accepts one parameter, which may be either a string with the name of the strategy to be used as default, or an object in the same format as the route handler's [auth options](#route-configuration).

Note that any routes added *before* `server.auth.default()` is called will not have the default applied to them. If you need to make sure that all routes have the default strategy applied, you must either call `server.auth.default()` before adding any of your routes, or set the default mode when registering the strategy.

## Route configuration

Authentication can also be configured on a route, by the `config.auth` parameter. If set to `false`, authentication is disabled for the route.

It may also be set to a string with the name of the strategy to use, or an object with `mode`, `strategies`, and `payload` parameters.

The `mode` parameter may be set to `'required'`, `'optional'`, or `'try'` and works the same as when registering a strategy.

When specifying one strategy, you may set the `strategy` property to a string with the name of the strategy. When specifying more than one strategy, the parameter name must be `strategies` and should be an array of strings each naming a strategy to try. The strategies will then be attempted in order until one succeeds, or they have all failed.

Lastly, the `payload` parameter can be set to `false` denoting the payload is not to be authenticated, `'required'` or `true` meaning that it *must* be authenticated, or `'optional'` meaning that if the client includes payload authentication information, the authentication must be valid.

The `payload` parameter is only possible to use with a strategy that supports the `payload` method in its scheme.
