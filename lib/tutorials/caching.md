## Client side caching

_This tutorial is compatible with hapi v11.x.x._

The HTTP protocol provides several different HTTP headers to control how browsers cache resources. To decide which headers are suitable for your use case check Google developers [guide](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching) or other [resources](https://www.google.com/search?q=HTTP+caching). This tutorial provides overview how to use these techniques with hapi.

### Cache-Control

The `Cache-Control` header tells the browser and any intermediate cache if a resource is cacheable and for what duration. For example, `Cache-Control:max-age=30, must-revalidate, private` means that the browser can cache the associated resource for thirty seconds and `private` means it should not be cached by intermediate caches, only by the browser. `must-revalidate` means that once it expires it has to request the resource again from the server.

Let's see how we can set this header in hapi:

```javascript
server.route({
    path: '/hapi/{ttl?}',
    method: 'GET',
    handler: function (request, reply) {

        const response = reply({ be: 'hapi' });
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
**Listing 1** Setting Cache-Control header

Listing 1 also illustrates that the `expiresIn` value can be overridden with the `ttl(msec)` method prodided by the [response object](http://hapijs.com/api#response-object) interface.

See [route-options](http://hapijs.com/api#route-options) for more information about common `cache` configuration options.

### Last-Modified

In some cases the server can provide information when resources were last modified. When using the [inert](https://github.com/hapijs/inert) plugin for serving static content, a `Last-Modified` header is added to every response payload.

When the `Last-Modified` header is set on a response, hapi compares it with the `If-Modified-Since` header coming from client to decide if the response status code should be `304`.

Assuming `lastModified` is Date object you can set this header via [response object](http://hapijs.com/api#response-object) interface as seen below, in Listing 2.

```javascript
   reply(result).header('Last-Modified', lastModified.toUTCString());
```
**Listing 2** Setting Last-Modified header

There is one more example using `Last-Modified` in the [last section](#client-and-server-caching) of this tutorial.

### ETag

The ETag header is an alternative to `Last-Modified` where the server provides a token (usually the checksum of the resource) instead of last modified timestamp. The browser will use this token to set the `If-None-Match` header in the next request. The server compares this header value with the new `ETag` checksum and responds with `304` if they are the same.

You only need to set `ETag` in your handler via `etag(tag, options)` function:

```javascript
   reply(result).etag('xxxxxxxxx');
```
**Listing 3** Setting ETag header

Check the documentation of `etag` under the [response object](http://hapijs.com/api#response-object) for more details about the parameters and available options.

## Server side caching

hapi provides powerful server side caching via [catbox](https://www.github.com/hapijs/catbox) and makes using cache very convenient. This tutorial section will help you understand how catbox is utilized inside hapi and how you can leverage it.

Catbox has two interfaces; client and policy.

### Client

[Client](https://github.com/hapijs/catbox#client) is a low-level interface that allows you set/get key-value pairs. It is initialized with one of the available adapters: ([Memory](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), [mongoDB](https://github.com/hapijs/catbox-mongodb), [Memcached](https://github.com/hapijs/catbox-memcached), or [Riak](https://github.com/DanielBarnes/catbox-riak)).

hapi always initialize one default [client](https://github.com/hapijs/catbox#client) with [memory](https://github.com/hapijs/catbox-memory) adapter. Let's see how we can define more clients.

```javascript
const Hapi = require('hapi');

const server = new Hapi.Server({
    cache: [
        {
            name: 'mongoCache',
            engine: require('catbox-mongodb'),
            host: '127.0.0.1',
            partition: 'cache'
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
**Listing 4** Defining catbox clients

In Listing 4, we've defined two catbox clients; mongoCache and redisCache. Including the default memory cache created by hapi, there are three available cache clients. You can replace the default client by omitting the `name` property when registering a new cache client. `partition` tells the adapter how cache should be named ('catbox' by default). In case of [mongoDB](http://www.mongodb.org/) it is database name and in case of [redis](http://redis.io/) it is used as key prefix.

### Policy

[Policy](https://github.com/hapijs/catbox#policy) is a more high-level interface than Client. Let's pretend we are dealing with something more complicated than adding two numbers and we want to cache the results. [server.cache](http://hapijs.com/api#servercacheoptions) creates a new [policy](https://github.com/hapijs/catbox#policy), which is then used in the route handler.

```javascript
const add = function (a, b, next) {

    return next(null, Number(a) + Number(b));
};

const sumCache = server.cache({
    cache: 'mongoCache',
    expiresIn: 20 * 1000,
    segment: 'customSegment',
    generateFunc: function (id, next) {

        add(id.a, id.b, next);
    },
    generateTimeout: 100
});

server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        const id = request.params.a + ':' + request.params.b;
        sumCache.get({ id: id, a: request.params.a, b: request.params.b }, (err, result) => {

            reply(result);
        });
    }
});
```
**Listing 5** Using `server.cache`

`cache` tells hapi which [client](https://github.com/hapijs/catbox#client) to use.

The first parameter of the `sumCache.get` function is an object with a mandatory key `id`, which is a unique item identifier string.

In addition to **partitions**, there are **segments** that allow you to isolate caches within one [client](https://github.com/hapijs/catbox#client). If you want to cache results from two different methods, you usually don't want mix the results together. In [mongoDB](http://www.mongodb.org/) adapters, `segment` represents a collection and in [redis](http://redis.io/) it's an additional prefix along with the `partition` option.

The default value for `segment` when [server.cache](http://hapijs.com/api#servercacheoptions) is called inside of a plugin will be `'!pluginName'`. When creating [server methods](http://hapijs.com/tutorials/server-methods), the `segment` value will be `'#methodName'`. If you have a use case for multiple policies sharing one segment there is a [shared](http://hapijs.com/api#servercacheoptions) option available as well.

### Server methods

But it can get better than that! In 95% cases you will use [server methods](http://hapijs.com/tutorials/server-methods) for caching purposes, because it reduces boilerplate to minimum. Let's rewrite Listing 5 using server methods:

```javascript
const add = function (a, b, next) {

    return next(null, Number(a) + Number(b));
};

server.method('sum', add, {
    cache: {
        cache: 'mongoCache',
        expiresIn: 30 * 1000,
        generateTimeout: 100
    }
});

server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        server.methods.sum(request.params.a, request.params.b, (err, result) => {

            reply(result);
        });
    }
});
```
**Listing 6** Using cache via server methods

[server.method()](http://hapijs.com/api#servermethodname-method-options) created a new [policy](https://github.com/hapijs/catbox#policy) with `segment: '#sum'` automatically for us. Also the unique item `id` (cache key) was automatically generated from parameters. By default, it handles `string`,`number` and `boolean` parameters. For more complex parameters, you have to provide your own `generateKey` function to create unique ids based on the parameters - check out the server methods [tutorial](http://hapijs.com/tutorials/server-methods) for more information.

### What next?

* Look into catbox policy [options](https://github.com/hapijs/catbox#policy) and pay extra attention to `staleIn`, `staleTimeout`, `generateTimeout`, which leverages the full potential of catbox caching.
* Check server methods [tutorial](http://hapijs.com/tutorials/server-methods) for more examples.

## Client and Server caching

[Catbox Policy](https://github.com/hapijs/catbox#policy) provides two more parameters `cached` and `report` which provides some details when an item is cached.

In this case we use `cached.stored` timestamp to set `last-modified` header.

```javascript
server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        server.methods.sum(request.params.a, request.params.b, (err, result, cached, report) => {

            const lastModified = cached ? new Date(cached.stored) : new Date();
            return reply(result).header('last-modified', lastModified.toUTCString());
        });
    }
});
```
**Listing 7** Server and client side caching used together
