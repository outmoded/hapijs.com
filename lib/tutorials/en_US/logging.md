## Logging

_This tutorial is compatible with hapi v17_

As with any server software, logging is very important. hapi has some built in logging methods, as well as some basic capability for displaying these logs.

### Built-in methods

There are two nearly identical logging methods, [`server.log(tags, [data, [timestamp]])`](/api#-serverlogtags-data-timestamp), and [`request.log(tags, [data])`](https://hapijs.com/api#-requestlogtags-data), which are to be called whenever you want to log an event in your application. You'll want to call `request.log()` whenever in the context of a request, such as in a route handler, request lifecycle extension or authentication scheme. You'll want to use `server.log()` everywhere else, where you have no specific request in scope, for instance, just after your server has started or inside a plugin's `register()` method.

They both accept the same first two parameters. They are, `tags` and `data`.

`tags` is a string or array of strings used to briefly identify the event. Think of them like log levels, but far more expressive. For example, you could tag an error retrieving data from your database like the following:

```javascript
server.log(['error', 'database', 'read']);
```

Any log events that hapi generates internally will always have the `hapi` tag associated with them.

The second parameter, `data`, is an optional string or object to log with the event. This is where you would pass in things like an error message, or any other details that you wish to go along with your tags.

Additionally `server.log()` accepts a third `timestamp` parameter. This defaults to `Date.now()`, and should only be passed in if you need to override the default for some reason.

### Retrieving and displaying logs

The hapi server object emits events for each log event. You can use the standard EventEmitter API to listen for such events and display them however you wish.


```javascript
server.events.on('log', (event, tags) => {

    if (tags.error) {
        console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
    }
});
```

Events logged with `server.log()` will emit a `log` event and events logged with `request.log()` will emit a `request` event.

You can retrive all logs for a particular request at once via `request.logs`. This will be an array containing all the logged request events. You must first set the `logs.collect` option to `true` on the route, otherwise this array will be empty.

```javascript
server.route({
    method: 'GET',
    path: '/',
    options: {
        logs: {
            collect: true
        }
    },
    handler: function (request, h) { ... }
})
```

### Debug mode (development only)

hapi has a debug mode, which is a pain-free way to have your log events printed to the console, without configuring additional plugins or writing logging code yourself.

By default, the only errors debug mode will print to console are uncaught errors in user code, and runtime errors from incorrect implementation of hapi's API. You can configure your server to print request events based on tag, however. For example, if you wanted to print any error in a request you would configure your server as follows:

```javascript
const server = Hapi.server({ debug: { request: ['error'] } });
```

You can find more information on debug mode in the [API documentation](https://hapijs.com/api#-serveroptionsdebug).

## Logging plugins

The built-in methods provided by hapi for retrieving and printing logs are fairly minimal. For a more feature-rich logging experience, you can look into using a plugin like [good](https://github.com/hapijs/good) or [bucker](https://github.com/nlf/bucker).
