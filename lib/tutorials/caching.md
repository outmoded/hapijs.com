## Client side caching

Http protocol provides several mechanisms how to cache resources in browser via http headers. To decide which headers are suitable for your use case check Google developers [guide](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching) or other [resources](https://www.google.com/search?q=HTTP+caching). This tutorial provides overview how to use these techniques in hapi.

### Cache-Control

`Cache-Control` header tells browser and any intermediate cache if resource is cacheable and for how long. For example `Cache-Control:max-age=30, must-revalidate, private` means that browser can cache resource for 30 seconds and `private` means that it should not be cached by intermediate caches, only by browser. `must-revalidate` means that once it expires it has to request the resource again.

Lets see how we can set this header in hapi:

```javascript
server.route({
   path: '/hapi/{ttl?}',
   method: 'GET',
   handler: function (request, reply) {

      var response = reply({be: 'hapi'});
      if (request.params.ttl) {
         response.ttl(request.params.ttl);
      }
   },
   config: {
      cache: {
         expiresIn: 30 * 1000,
         privacy: 'private'
      }
   }
});
```

Example also illustrates that `expiresIn` value can be overridden with `ttl(msec)` function using [response object](http://hapijs.com/api#response-object) interface.

See [route-options](http://hapijs.com/api#route-options) for more options.
### Last-Modified

In some cases server can provide information when resources was last modified. Good example is [inert](https://github.com/hapijs/inert) module, which is responsible for serving static files in hapi (`file` and `directory` handler). Last modification timestamp is read for every requested file and send as `Last-Modified` header.

When `Last-Modified` is set on response hapi compares it with `If-Modified-Since` coming from client to decide if should return `304`.


Assuming `lastModified` is Date object you can set this header via [response object](http://hapijs.com/api#response-object) interface.

```
   reply(result).header('Last-Modified', lastModified.toUTCString());
```

There is one more example using `Last-Modified` in [last section](#client-and-server-caching).

### ETag

ETag is alternative to `last-modified` where server provides token (usually checksum of resource) instead of last modified timestamp. Browser in next request sends this ETag in `If-None-Match` header. Server compares it with new `ETag` and return `304` if it's the same.

You only need to set `ETag` in your handler via `etag(tag, options)` function:

```
   reply(result).etag('xxxxxxxxx');
```

Check `options` parameter for `etag` function on [api](http://hapijs.com/api#response-object) page for more details.


## Server side caching

hapi provides powerful server side caching via [catbox](https://www.github.com/hapijs/catbox) and makes using cache very convenient. This tutorial help you to understand how catbox is utilized inside hapi and how you can use it. Catbox also can be used out of the hapi, but that is not covered here.

Catbox has two interfaces.


### Client
[Client](https://github.com/hapijs/catbox#client) is low-level interface, which basically allows you set/get key-value pairs. Its initialized with one of the available adapters ([Memory](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), [mongoDB](https://github.com/hapijs/catbox-mongodb), [Memcached](https://github.com/hapijs/catbox-memcached), [Riak](https://github.com/DanielBarnes/catbox-riak), [Amazon S3](https://github.com/fhemberger/catbox-s3)).

hapi always initialize one default [client](https://github.com/hapijs/catbox#client) with [memory](https://github.com/hapijs/catbox-memory) adapter. Lets see how we can define more clients.

```javascript
var Hapi = require('hapi');

var server = new Hapi.Server({
    cache: [
        {
            name: 'mongoCache',
            engine: require('catbox-mongodb'),
            host: '127.0.0.1',
            partition: 'cache',
        },
        {
            name: 'redisCache',
            engine: require('catbox-redis'),
            host: '127.0.0.1',
            partition: 'cache'
       }
    ]
});

server.connection({
    port: 8000
});
```

In this example two [clients](https://github.com/hapijs/catbox#client) were defined: `'mongoCache'`, `'redisCache'` and also default one without name with [memory](https://github.com/hapijs/catbox-memory) adapter. You can replace default client by omitting `name` property. `partition` property tells adapter how cache should be named (`'catbox'` by default). In case of [mongoDB](http://www.mongodb.org/) it is database name and in case of [redis](http://redis.io/) it is used as key prefix.

### Policy
[Policy](https://github.com/hapijs/catbox#policy) is high-level interface that you will be using. Lets pretend we are dealing with something more complicated than adding two numbers and we want to cache the results. [server.cache](http://hapijs.com/api#servercacheoptions) method creates new [policy](https://github.com/hapijs/catbox#policy), which is than used in handler. `id` object has mandatory key `id`, which is a unique item identifier string.

```javascript
var add = function (a, b, next) {

    return next(null, Number(a) + Number(b));
};

var sumCache = server.cache({
    cache: 'mongoCache',
    expiresIn: 20 * 1000,
    segment: 'customSegment',
    generateFunc: function (id, next) {

        add(id.a, id.b, next);
    }
});

server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        var id = request.params.a + ':' + request.params.b;
        sumCache.get({id: id, a: request.params.a, b: request.params.b}, function (err, result) {

            reply(result);
        })
    }
});
```

`cache` property tells hapi which [client](https://github.com/hapijs/catbox#client) to use.

In addition to **partitions** there are **segments** that allows to isolate caches within one [client](https://github.com/hapijs/catbox#client). If you want to cache results from two different methods, you usually don't want mix up the results. In [mongoDB](http://www.mongodb.org/) `segment` represents collection and in [redis](http://redis.io/) it's additional prefix to `partition` prefix. Default value for `segment` is provided when [server.cache](http://hapijs.com/api#servercacheoptions) is called inside plugin - `'!pluginName'` or used via [server methods](http://hapijs.com/tutorials/server-methods) - `'#methodName'`. If you have use case for multiple policies sharing one segment there is [shared](http://hapijs.com/api#servercacheoptions) option.

### Server methods
But it can get better than that! In 95% cases you will use [server methods](http://hapijs.com/tutorials/server-methods) for caching purposes, because it reduces boilerplate to minimum. Lets do the same with server methods:

```javascript
server.method('sum', add, { cache: { cache: 'mongoCache', expiresIn: 30 * 1000 } });

server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        server.methods.sum(request.params.a, request.params.b, function (err, result) {

            reply(result);
        });
    }
});
```

Function [server.method()](http://hapijs.com/api#servermethodname-method-options) created new [policy](https://github.com/hapijs/catbox#policy) with `segment: '#sum'`. Also unique item `id` was automatically generated from parameters - by default it handles `string`,`number` and `boolean` parameters, for more complex parameters you have to provide own `generateKey` function, read more details in server methods [tutorial](http://hapijs.com/tutorials/server-methods).

### What next?

* Look into catbox policy [options](https://github.com/hapijs/catbox#policy). Especially to `staleIn`, `staleTimeout`, `generateTimeout`, which exploits full potential of catbox caching.
* Check server methods [tutorial](http://hapijs.com/tutorials/server-methods) for more examples.

## Client and Server caching

[Catbox Policy](https://github.com/hapijs/catbox#policy) provides two more parameters `cached` and `report` which provides some details when item is cached.

In this case we use `cached.stored` timestamp to set `last-modified` header.

```javascript
server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        server.methods.sum(request.params.a, request.params.b, function (err, result, cached, report) {

            var lastModified = cached ? new Date(cached.stored) : new Date();
            return reply(result).header('last-modified', lastModified.toUTCString());
        });
    }
});
```




