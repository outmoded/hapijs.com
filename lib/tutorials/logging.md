## Built-in methods

As with any server software, logging is very important. Hapi has some built in logging methods, as well as some limited capability for viewing these logs.

There are two nearly identical logging methods, `server.log`, and `request.log`. The difference between the two is in what event they emit, what object emits the event, and what data is automatically associated. The `server.log` method emits a `log` event on the server, and has the server's URI associated with it. `request.log` emits a `request` event on the `server` and has the request's internal id associated with it.

They both accept up to three parameters. They are, in order, `tags`, `data`, and `timestamp`.

`tags` is a string or array of strings used to briefly identify the event. Think of them like log levels, but far more expressive. For example, you could tag an error retrieving data from your database like the following:

```javascript
server.log(['error', 'database', 'read']);
```

Any log events that hapi generates internally will always have the `hapi` tag associated with them.

The second parameter, data, is an optional string or object to log with the event. This is where you would pass in things like an error message, or any other details that you wish to go along with your tags. The log event will automatically have the uri of the server it's associated with as a property.

Last is the timestamp parameter. This defaults to `Date.now()`, and should only be passed in if you need to override the default for some reason.

### Retrieving request logs

Hapi also provides a method (`request.getLog`) to retrieve log events from a request, assuming you still have access to the request object. If called with no parameters it will return an array of all log events associated with the request. You may also pass a tag or array of tags to filter the result set. This can be useful for retrieving a history of all logged events on a request when an error occurs for analysis.

### Configuration

By default, the only errors hapi will print to console are uncaught errors in external code, and runtime errors from incorrect implementation of hapi's API. You can configure your server to print request events based on tag, however. For example, if you wanted to print any error in a request you would configure your server as follows:

```javascript
var server = new Hapi.Server({ debug: { request: ['error'] } });
```

## Logging plugins

The built-in methods are fairly minimal, however, and for more thorough logging you should really look into using a plugin like [good](https://github.com/hapijs/good) or [bucker](https://github.com/nlf/bucker).
