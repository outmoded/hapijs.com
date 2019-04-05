# Authentication

_This tutorial is compatible with hapi v17_

- [Overview](#overview)
- [Schemes](#schemes)
    - [authenticate](#authenticate)
    - [payload](#payload)
    - [response](#response)
- [Strategies](#strategies)
- [Default Strategy](#default)
- [Route Configuration](#route)
- [hapi-auth-basic](#basic)
- [hapi-auth-cookie](#cookie)


## <a name="overview" /> Overview

Most modern web apps use some form of authentication. Authentication within hapi is based on the concept of `schemes` and `strategies`. `Schemes` are a way of handling authentication within hapi. For example, the `hapi-auth-basic` and `hapi-auth-cookie` plugins would be considered `schemes`. A `strategy` is a pre-configured instance of a `scheme`. You use `strategies` to implement authentication `schemes` into your application.  

## <a name="schemes" /> Schemes

A `scheme` is a method with the signature `function (server, options)`. The `server` parameter is a reference to the server the scheme is being added to, while the `options` parameter is the configuration object provided when registering a strategy that uses this scheme.

This method must return an object with *at least* the key `authenticate`. Other optional methods that can be used are `payload` and `response`.

You can either write your own authentication `scheme`, or use one of the many hapi auth plugins, such as `hapi-auth-basic` or `hapi-auth-cookie`.

### <a name="authenticate" /> authenticate

The `authenticate` method has a signature of `function (request, h)`, and is the only *required* method in a scheme.

In this context, `request` is the `request` object created by the server. It is the same object that becomes available in a route handler, and is documented in the [API reference](/api#request-object).

`h` is the standard hapi [response toolkit](https://hapijs.com/api#response-toolkit).

When authentication is successful, you must call and return `h.authenticated({ credentials, artifacts })`. `credentials` property is an object representing the authenticated user (or the credentials the user attempted to authenticate with). Additionally, you may also have an `artifacts` key, which can contain any authentication related data that is not part of the user's credentials.

The `credentials` and `artifacts` properties can be accessed later (in a route handler, for example) as part of the `request.auth` object.

If authentication is unsuccessful, you can either throw an error or call and return `h.unauthenticated(error, [data])` where `error` is an authentication error and `data` is an optional object containing `credentials` and `artifacts`. There's no difference between calling `return h.unauthenticated(error)` or throwing an error if no `data` object is provided. The specifics of the error passed will affect the behavior. More information can be found in the API documentation for [`server.auth.scheme(name, scheme)`](https://hapijs.com/api#-serverauthschemename-scheme). It is recommend to use [boom](https://github.com/hapijs/boom) for errors.

### <a name="payload" /> payload

The `payload` method has the signature `function (request, h)`.

Again, the standard hapi response toolkit is available here. To signal a failure throw an error, again it's recommended to use [boom](https://github.com/hapijs/boom) for errors.

To signal a successful authentication, return `h.continue`.

### <a name="response" /> response

The `response` method also has the signature `function (request, h)` and utilizes the standard response toolkit.

This method is intended to decorate the response object (`request.response`) with additional headers, before the response is sent to the user.

Once any decoration is complete, you must return `h.continue`, and the response will be sent.

If an error occurs, you should instead throw an error where the error is recommended to be a [boom](https://github.com/hapijs/boom).

## <a name="strategies" /> Strategies

Once you've registered your scheme, you need a way to use it. This is where strategies come in.

As mentioned above, a strategy is essentially a pre-configured instance of a scheme.

To register a strategy, you must first have a scheme registered. Once that's complete, use `server.auth.strategy(name, scheme, [options])` to register your strategy.

The `name` parameter must be a string, and will be used later to identify this specific strategy. `scheme` is also a string, and is the name of the scheme this strategy is to be an instance of. The `options` parameter is use to customize the options of the `strategy`.  

```js
server.auth.strategy('session', 'cookie', {
    name: 'sid-example',
    password: '!wsYhFA*C2U6nz=Bu^%A@^F#SF3&kSR6',
    isSecure: false
});
```
In the above example, you register the `strategy` with `server.auth.strategy()`. You name the `strategy` `session`, and say that you are using the `cookie` scheme. Lastly, you configure the `strategy` by giving it a `name`, `password`, and setting `isSecure: false`. 

## <a name="default" /> Default Strategy

You may set a default strategy by using `server.auth.default()`.

This method accepts one parameter, which may be either a string with the name of the strategy to be used as default, or an object in the same format as the route handler's [auth options](#route-configuration).

Note that any routes added *before* `server.auth.default()` is called will not have the default applied to them. If you need to make sure that all routes have the default strategy applied, you must either call `server.auth.default()` before adding any of your routes, or set the default mode when registering the strategy.

## <a name="route" /> Route Configuration

Authentication can also be configured on a route, by the `options.auth` parameter. If set to `false`, authentication is disabled for the route.

It may also be set to a string with the name of the strategy to use, or an object with `mode`, `strategies`, and `payload` parameters.

The `mode` parameter may be set to `'required'`, `'optional'`, or `'try'` and works the same as when registering a strategy.

If set to `'required'`, in order to access the route, the user must be authenticated, and their authentication must be valid, otherwise they will receive an error.

If `mode` is set to `'optional'` the strategy will still be applied to the route but in this case the user does *not* need to be authenticated. Authentication data is optional, but must be valid if provided.

The last `mode` setting is `'try'`. The difference between `'try'` and `'optional'` is that with `'try'` invalid authentication is accepted, and the user will still reach the route handler.

When specifying one strategy, you may set the `strategy` property to a string with the name of the strategy. When specifying more than one strategy, the parameter name must be `strategies` and should be an array of strings each naming a strategy to try. The strategies will then be attempted in order until one succeeds, or they have all failed.

Lastly, the `payload` parameter can be set to `false` denoting the payload is not to be authenticated, `'required'` or `true` meaning that it *must* be authenticated, or `'optional'` meaning that if the client includes payload authentication information, the authentication must be valid.

The `payload` parameter is only possible to use with a strategy that supports the `payload` method in its scheme.

## <a name="basic" /> hapi-auth-basic

The first `scheme` we will look at is the [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic) plugin. Just like the name says, the `hapi-auth-basic` plugin uses basic authentication to validate users. Here is an example of setting up `hapi-auth-basic`:

```js
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = async (request, username, password) => {

    const user = users[username];
    if (!user) {
        return { credentials: null, isValid: false };
    }

    const isValid = await Bcrypt.compare(password, user.password);
    const credentials = { id: user.id, name: user.name };

    return { isValid, credentials };
};

const start = async () => {

    const server = Hapi.server({ port: 4000 });

    await server.register(require('hapi-auth-basic'));

    server.auth.strategy('simple', 'basic', { validate });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: 'simple'
        },
        handler: function (request, h) {

            return 'welcome';
        }
    });

    await server.start();

    console.log('server running at: ' + server.info.uri);
};

start();
```

First, you define your `users` database, which is a simple object in this example. Then you define a validation function, which is a feature specific to [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic) and allows you to verify that the user has provided valid credentials. For this validation function, you use `Bcrypt` to compare the user provided password with the hashed password in your database.  

Next, you register the plugin, which creates a scheme with the name of `basic`. This is done within the plugin via [server.auth.scheme()](/api#-serverauthschemename-scheme).

Once the plugin has been registered, you use [server.auth.strategy()](/api#server.auth.strategy()) to create a strategy with the name of `simple` that refers to your scheme named `basic`. You also pass an options object that gets passed to the scheme and allows you to configure its behavior.

The last thing you do is tell a route to use the strategy named `simple` for authentication.

## <a name="cookie" /> hapi-auth-cookie

[hapi-auth-cookie](https://github.com/hapijs/hapi-auth-cookie) is a plugin that will store a cookie in the users browser once they are authenticated. This has the option of keeping the user logged in, even after they leave the site. Here is an example of setting up `hapi-auth-cookie`:

In this example, the home route, "/", is restricted and can only be accessed once a user has authenticated themselves:  

```js
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');

const users = [
    {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
];

const start = async () => {

    const server = Hapi.server({ port: 4000 });

    await server.register(require('hapi-auth-cookie'));

    server.auth.strategy('session', 'cookie', {
        cookie: {
            name: 'sid-example',
            password: '!wsYhFA*C2U6nz=Bu^%A@^F#SF3&kSR6',
            isSecure: false
        },
        redirectTo: '/login',
        validateFunc: async (request, session) => {

            const account = await users.find(
                (user) => (user.id === session.id)
            );

            if (!account) {

                return { valid: false };
            }

            return { valid: true, credentials: account };
        }
    });

    server.auth.default('session');

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: function (request, h) {

                return 'Welcome to the restricted home page!';
            }
        },
        {
            method: 'GET',
            path: '/login',
            handler: function (request, h) {

                return ` <html>
                            <head>
                                <title>Login page</title>
                            </head>
                            <body>
                                <h3>Please Log In</h3>
                                <form method="post" action="/login">
                                    Username: <input type="text" name="username"><br>
                                    Password: <input type="password" name="password"><br/>
                                <input type="submit" value="Login"></form>
                            </body>
                        </html>`;
            },
            options: {
                auth: false
            }
        },
        {
            method: 'POST',
            path: '/login',
            handler: async (request, h) => {

                const { username, password } = request.payload;
                const account = users.find(
                    (user) => user.username === username
                );

                if (!account || !(await Bcrypt.compare(password, user.password))) {

                    return h.view('/login');
        }

                request.cookieAuth.set({ id: user.id });

                return h.redirect('/');
             }
        }
    ]);

    await server.start();

    console.log('server running at: ' + server.info.uri);
};

start();
```
First, you need to do is register the `hapi-auth-cookie` plugin with `server.register`. Once the plugin is registered, you configure your `strategy` by calling `server.auth.strategy`. `server.auth.strategy` takes three parameters: name of the strategy, what scheme you are using, and an options object. For your strategy, you name it `session`. For the scheme, you will be using the `cookie` scheme. If you were using `hapi-auth-basic`, this parameter would be `basic`. The last parameter is an options object. This is how you can customized your auth strategy to fit your needs.

The first property you configure is the `cookie` object. In your `strategy`, you will configure three properties of the `cookie` object. First, you set the name of the cookie, in this case `sid-example`.  Next, you set the password that will be used to encrypt the cookie. This should be at least 32 characters long. Last, you set `isSecure` to `false`. This is ok for development while working over HTTP. In production, this should be switched back to `true`, which is the default setting. 

The next property is `redirectTo`. This will tell the server where to redirect to if an unauthenticated user tries to access a resource that requires authentication.  

The last property is the `validateFunc` function. The `validateFunc` validates that a current cookie is still valid. For example, if a user authenticates themselves successfully, receives a cookie, and then leaves the site. Once they return, the `validateFunc` will check if their current cookie is still valid. 

You setup the default strategy by calling `server.auth.default('session')`. This will set set the default auth strategy for all routes.   

Once your strategy is set up, you need to set up route that will validate the provided username and password. In this case, your `POST` route to `'/login'` will do just that. First, it will pull the `username` and `password` from `request.payload`, which the user provided in the form from the `'/login'` `'GET'` route. Next, you find the user from the database by searching for their username:

```js
const account = users.find(
    (user) => user.username === username
);
```
If the user doesn't not exists, or if the provided password is wrong, you redirect the user back to the login page. You use `Bcrypt` to compare the user provided password with the hashed password from the database.  

Lastly, if the user does exist, and the passwords match, the user is then redirected to the homepage.  

For more info on additional hapi auth plugins, please see the [plugin section](https://hapijs.com/plugins).
