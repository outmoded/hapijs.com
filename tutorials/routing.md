# Routing
## Routes

When defining a route in hapi, as in other frameworks, you need three basic elements: the path, the method, and a handler. These are passed to your server as an object, and can be as simple as the following:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello!');
    }
});
```

## Methods

This route responds to a `GET` request to `/` with the string `Hello!`. The method option can be any valid HTTP method, or an array of methods. Let's say you want the same response when your user sends either a `PUT` or a `POST` request, you could do that with the following:

```javascript
server.route({
    method: ['PUT', 'POST'],
    path: '/',
    handler: function (request, reply) {
        reply('I did something!');
    }
});
```

## Path

The path option must be a string, though it can contain named parameters. To name a parameter in a path, simply wrap it with `{}`. For example:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user}',
    handler: function (request, reply) {
        reply('Hello ' + encodeURIComponent(request.params.user) + '!');
    }
});
```

As you can see above, we have the string `{user}` in our path, which means we're asking for that segment of the path to be assigned to a named parameter. These parameters are stored in the object `request.params` within the handler. Since we named our parameter `user` we are able to access the value with the property `request.params.user`, after URI encoding it so as to prevent content injection attacks.

### Optional parameters

In this example the user parameter is required: a request to `/hello/bob` or `/hello/susan` will work, but a request to `/hello` will not. In order to make a parameter optional, put a question mark at the end of the parameter's name. Here is the same route, but updated to make the `user` parameter optional:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user?}',
    handler: function (request, reply) {
        var user = request.params.user ? encodeURIComponent(request.params.user) : 'stranger';
        reply('Hello ' + user + '!');
    }
});
```

Now a request to `/hello/mary` will reply with `Hello mary!` and a request to just `/hello` will reply with `Hello stranger!`. It is important to be aware that only the *last* named parameter in a path can be optional. That means that `/{one?}/{two}/` is an invalid path, since in this case there is another parameter after the optional one. You may also have a named parameter covering only part of a segment of the path, but you may only have one named parameter per segment. That means that `/{filename}.jpg` is valid while `/{filename}.{ext}` is not.

### Multi-segment parameters

Along with optional path parameters, you can also allow parameters that match multiple segments. In order to do this, we use an asterisk and a number. For example:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user*2}',
    handler: function (request, reply) {
        var userParts = request.params.user.split('/');
        reply('Hello ' + encodeURIComponent(userParts[0]) + ' ' + encodeURIComponent(userParts[1]) + '!');
    }
});
```

With this configuration, a request to `/hello/john/doe` will reply with the string `Hello john doe!`. The important thing to note here is that the parameter is a string containing the `/` character. That's why we did a split on that character to get the two separate parts. The number after the asterisk represents how many path segments should be assigned to the parameter. You can also omit the number entirely, and the parameter will match any number of segments available. Like the optional parameters, a wildcard parameter (for example `/{files*}`) may *only* appear as the last parameter in your path.

When determining what handler to use for a particular request, hapi searches paths in order from most specific to least specific. That means if you have two routes, one with the path `/filename.jpg` and a second route `/filename.{ext}` a request to `/filename.jpg` will match the first route, and not the second. This also means that a route with the path `/{files*}` will be the *last* route tested, and will only match if all other routes fail.

## Handler method

The handler option is a function that accepts two parameters, `request`, and `reply`.

The `request` parameter is an object with details about the end user's request, such as path parameters, an associated payload, authentication information, headers, etc. Full documentation on what the `request` object contains can be found in the [API reference](https://github.com/hapijs/hapi/blob/master/docs/Reference.md#request-properties).

The second parameter, `reply`, is the method used to respond to the request. As you've seen in the previous examples, if you wish to respond with a payload you simply pass the payload as a parameter to `reply`. The payload may be a string, a buffer, a JSON serializable object, or a stream. The result of `reply` is a response object, that can be chained with additional methods to alter the response before it is sent. For example `reply('created').code(201)` will send a payload of `created` with an HTTP status code of `201`. You may also set headers, content type, content length, send a redirection response, and many other things that are documented in the [API reference](https://github.com/hapijs/hapi/blob/master/docs/Reference.md#response-object).

## Config

Aside from these three basic elements, you may also specify a `config` parameter for each route. This is where you configure things like [validation](/tutorials/validation), [authentication](/tutorials/auth), prerequisites, payload processing, and caching options. More details can be found in the linked tutorials, as well as the [API reference](/api#route-options).

Here we will look at a couple of options designed to help generate documentation.

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user?}',
    handler: function (request, reply) {
        var user = request.params.user ? encodeURIComponent(request.params.user) : 'stranger';
        reply('Hello ' + request.params.user + '!');
    },
    config: {
        description: 'Say hello!',
        notes: 'The user parameter defaults to \'stranger\' if unspecified',
        tags: ['api', 'greeting']
    }
});
```

Functionally speaking these options have no effect, however they can be very valuable when using a plugin like [lout](https://github.com/hapijs/lout) to generate documentation for your API. The metadata is associated with the route, and becomes available for inspection or display later.
