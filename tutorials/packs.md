# Packs
## Packs

Packs are a way of combining multiple servers together into one logical unit. This allows you to register plugins, configure caching, as well as start and stop a batch of servers all at once.

## Creating a pack

To create a new pack:

```javascript
var Hapi = require('hapi');
var pack = new Hapi.Pack();
```

The pack constructor accepts a single `options` parameter, which may contain `app`, `cache`, or `debug` keys. These options are identical to the same options on the [server object](/api#server-options), and will be applied to all servers created within the pack.

## Using your pack

Once your pack has been created, there are a few things you can do with it.

The pack has `app`, `events`, and `plugins` properties associated with it. The `app` and `plugins` properties are, again, identical to the same properties on the [server object](/api#server-properties).

The `events` property is an event emitter that can be used to listen for events that occur on any server that is a member of your pack. It can additionally emit `'start'` and `'stop'` events when the pack is started or stopped.

### `pack.server()`

To add a server to a pack, use the `pack.server()` method. The parameters are identical to the [server object](/api#server-options) options, with the exception that you cannot configure the cache on individual servers. It must be done at the pack level, instead.

### Starting and stopping

Packs have the same `start` and `stop` methods as servers. This gives you a convenient way of changing the state of multiple servers at once.

```javascript
pack.start(function () {
    console.log('All servers started');

    pack.stop({ timeout: 60 * 1000 }, function () {
        console.log('All servers stopped');
    });
});
```

### Registering plugins

For information on `pack.register()` see either the [plugins tutorial](/tutorials/plugins) or the [API reference](/api#packregisterplugins-options-callback).

### Composing a pack

It is also possible to build a pack from a single configuration object by using the `Pack.compose()` method.

An example of this usage exists in the [API reference](/api#packcomposemanifest-options).

This lends a very convenient way of building your applications, in that you can write all of your logic as plugins, and have a single JavaScript file to contain your configuration and build your server. Eran Hammer's [postmile](https://github.com/hueniverse/postmile) application is an excellent example of this.
