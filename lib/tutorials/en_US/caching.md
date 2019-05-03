# Caching

_This tutorial is compatible with hapi v17_

- [Overview](#overview)
- [Client-side Caching](#client-side)
    - [Cache-Control](#cache-control)
    - [Last-Modified](#last-modified)
    - [ETag](#etag)
- [Server-side Caching](#server-side)
    - [catbox](#catbox)
    - [Client](#client)
    - [Policy](#policy)
    - [Server Methods](#serverMethods)
- [Client and Server Caching](#clientandserver)


## <a name="overview" /> Overview

One of the best ways to improve website performance is to configure caching on your server. hapi makes it easy to configure both client-side and server-side caching.

## <a name="client-side" /> Client-side Caching

The HTTP protocol defines several HTTP headers to instruct how clients, such as browsers, should cache resources. To learn more about these headers and to decide which are suitable for your use-case check out this useful [guide put together by Google](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching).

The first part of this tutorial shows how to easily configure hapi to send these headers to clients.

### <a name="cache-control" /> Cache-Control

The `Cache-Control` header tells the browser and any intermediate caches if a resource is cacheable and for what duration. For example, `Cache-Control:max-age=30, must-revalidate, private` means that the browser can cache the associated resource for thirty seconds and `private` means it should not be cached by intermediate caches, only by the browser. `must-revalidate` means that once it expires it has to request the resource again from the server.

Let's see how you can set this header in hapi:

```javascript
server.route({
    path: '/hapi/{ttl?}',
    method: 'GET',
    handler: function (request, h) {

        const response = h.response({ be: 'hapi' });

        if (request.params.ttl) {
            response.ttl(request.params.ttl);
        }

        return response;
    },
    options: {
        cache: {
            expiresIn: 30 * 1000,
            privacy: 'private'
        }
    }
});
```

The above example shows how you can set a `cache` options object on a route. Here you set `expiresIn` to 30 seconds and `privacy` to private.
The example also illustrates that the `expiresIn` value can be overridden with the `ttl(msec)` method provided by the [response object](/api#response-object) interface.

If you make a request to `/hapi` you'll receive the response header `cache-control: max-age=30, must-revalidate, private`. If you make a request to `/hapi/5000` you'll instead get the header `cache-control: max-age=5, must-revalidate, private`.

See [route-options](/api#route-options) for more information about common `cache` configuration options.

### <a name="last-modified" /> Last-Modified

In some cases, the server can provide information about when a resource was last modified. When using the [inert](https://github.com/hapijs/inert) plugin for serving static content, a `Last-Modified` header is added automatically to every response.

When the `Last-Modified` header is set on a response, hapi compares it with the `If-Modified-Since` header coming from the client to decide if the response status code should be `304 Not Modified`. This is also known as a conditional GET request. The advantage being that there's no need for the browser to download the file again for a `304` response.

Assuming `lastModified` is a `Date` object you can set this header via the [response object](/api#response-object) as seen here:

```javascript
return h.response(result)
    .header('Last-Modified', lastModified.toUTCString());
```
There is one more example using `Last-Modified` in the [last section](#clientandserver) of this tutorial.

### <a name="etag" /> ETag

The ETag header is an alternative to `Last-Modified` where the server provides a token (usually a checksum of the resource) instead of a last modified timestamp. The browser will use this token to set the `If-None-Match` header in the next request. The server compares this header value with the new `ETag` checksum and responds with `304` if they are the same.

You only need to set `ETag` in your handler via `etag(tag, options)` function:

```javascript
return h.response(result).etag('xxxxxxxxx');
```

Check the documentation of `etag` under the [response object](/api#response-object) for more details about the arguments and available options.

## <a name="server-side" /> Server-side Caching

hapi provides powerful, convenient server-side caching via [catbox](https://www.github.com/hapijs/catbox). This tutorial section will help you understand how to use catbox.

### <a name="catbox" /> catbox

[catbox](https://github.com/hapijs/catbox) is a multi-strategy key-value object store. It comes with extensions supporting a memory cache, [Redis](https://redis.io), and [Memcached](http://memcached.org).

In order to reduce module dependencies, catbox does not include the external caching strategies. To use other strategies, each service must be manually installed via npm or package dependencies manually.

catbox has two interfaces; client and policy.

### <a name="client" /> Client

[Client](https://github.com/hapijs/catbox#client) is a low-level interface that allows you set/get key-value pairs. It is initialized with one of the available adapters: ([Memory](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), or [Memcached](https://github.com/hapijs/catbox-memcached).

hapi initializes a default [client](https://github.com/hapijs/catbox#client) using the [catbox memory](https://github.com/hapijs/catbox-memory) adapter. Let's see how you can define another client using the [redis](http://redis.io/) strategy.

```javascript
'use strict';

const Hapi = require('@hapi/hapi');
const CatboxRedis = require('@hapi/catbox-redis');

const server = Hapi.server({
    port: 8000,
    cache: [
        {
            name: 'my_cache',
            provider: {
                constructor: CatboxRedis,
                options: {
                    partition : 'my_cached_data'
                    host: 'redis-cluster.domain.com',
                    port: 6379,
                    database: 0,
                    tls: {},
                }
            }
        }
    ]    
});
```

In the above example, you defined a new catbox client, `my_cache`. Including the default memory cache created by hapi, there are now two available cache clients. You can replace the default client by omitting the `name` property when registering a new cache client. `partition` tells the adapter how cache should be named ('catbox' by default). In the case of [redis](http://redis.io/) it is used as key prefix.

### <a name="policy" /> Policy

[Policy](https://github.com/hapijs/catbox#policy) is a more high-level interface than Client. The following is a simple example of caching the result of adding two numbers together. The principles of this simple example can be applied to any situation where you want to cache the result of a function call, async or otherwise. [server.cache(options)](/api#-servercacheoptions) creates a new [policy](https://github.com/hapijs/catbox#policy), which is then used in the route handler.

```javascript
const start = async () => {

    const server = Hapi.server();

    const add = async (a, b) => {

        await Hoek.wait(1000);   // Simulate some slow I/O

        return Number(a) + Number(b);
    };

    const sumCache = server.cache({
        cache: 'my_cache',
        expiresIn: 10 * 1000,
        segment: 'customSegment',
        generateFunc: async (id) => {

            return await add(id.a, id.b);
        },
        generateTimeout: 2000
    });

    server.route({
        path: '/add/{a}/{b}',
        method: 'GET',
        handler: async function (request, h) {

            const { a, b } = request.params;
            const id = `${a}:${b}`;

            return await sumCache.get({ id, a, b });
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```
If you make a request to `http://localhost:8000/add/1/5`, you should get the response `6` after about a second. If you hit that endpoint again the response should come immediately because it's being served from the cache. If you were to wait 10s and then call it again, you'd see that it took a while because the cached value has now been ejected from the cache.

`server.cache(options)` provisions a cache segment within the server cache facility. In this case, your policy will be using `'my_cache'` which you created above with `server.cache`.

`expiresIn` states the time, in milliseconds, the cache will expire in relation to the time the item was saved in the cache. In this case, our cache will expire 10 seconds after the item was saved. 

`segment` that allow you to further isolate caches within one [client](https://github.com/hapijs/catbox#client) partition. If you want to cache results from two different methods, you usually don't want mix the results together. In [redis](http://redis.io/), `segment` is an additional prefix along with the `partition` option. The default value for `segment` when [server.cache()](/api#-servercacheoptions) is called inside of a plugin will be `'!pluginName'`. When creating [server methods](/tutorials/server-methods), the `segment` value will be `'#methodName'`. If you have a use case for multiple policies sharing one segment there is a [shared](/api#-servercacheoptions) option available as well.

`generateFunc` is a function that will generate a new cache item if one is not found in the cache when calling `get()`. In this example, the generate function will generate a value of two numbers add together. The `generateFunc` function will also be called if an item in the cache exists, but is found to be stale. You can set the time when an item in the cache will be stale by configuring the `staleIn` option. `staleIn` is a number in milliseconds to mark an item stored in cache as stale and attempt to regenerate it when `generateFunc` is provided. `staleIn` must be less than `expiredIn`.

`generateTimeout` is the number of milliseconds to wait before returning a timeout error when the `generateFunc` function takes too long to return a value.

`get(id)` is used to retrieve an item from the cache. If the item is not found, and the `generateFunc` method was provided, a new value is generated, stored in the cache, and is returned. 

The first parameter of the `sumCache.get()` function is an id, which may either be a string or an object with a mandatory property `id`, which is a unique cache item identifier.

Look into catbox policy [options](https://github.com/hapijs/catbox#policy) and pay extra attention to `staleIn`, `staleTimeout`, `generateTimeout`, to leverage the full potential of catbox caching.

### <a name="serverMethods" /> Server methods

But it can get better than that! In 95% cases you will use [server methods](/tutorials/server-methods) for caching purposes, because it reduces boilerplate to minimum. Here's a rewrite of the previous example using a server method:

```javascript
const start = async () => {

    const server = Hapi.server();

    server.method('sum', add, {
        cache: {
            cache: 'my_cache',
            expiresIn: 10 * 1000,
            generateTimeout: 2000
        }
    });

    server.route({
        path: '/add/{a}/{b}',
        method: 'GET',
        handler: async function (request, h) {

            const { a, b } = request.params;
            return await server.methods.sum(a, b);
        }
    });

    await server.start();

};

start();
```
[server.method()](/api#-servermethodname-method-options) created a new [policy](https://github.com/hapijs/catbox#policy) with `segment: '#sum'` automatically for us. Also the unique item `id` (cache key) was automatically generated from parameters. By default, it handles `string`, `number` and `boolean` parameters. For more complex parameters, you have to provide your own `generateKey` function to create unique ids based on the parameters - check out the server methods [tutorial](/tutorials/server-methods) for more information.

## <a name="clientandserver" /> Client and Server caching

Optionally, [Catbox Policy](https://github.com/hapijs/catbox#policy) can provide more information about the value retrieved from the cache. To enable this set the `getDecoratedValue` option to `true` when creating the policy. Any value returned from the server method will then be an object `{ value, cached, report }`. `value` is just the item from the cache, `cached` and `report` provides some extra details about the cache state of the item.

An example of server-side and client-side caching working together is using the `cached.stored` timestamp to set the `last-modified` header:

```javascript
const start = async () => {

    const server = Hapi.server();

    server.method('sum', add, {
        cache: {
            cache: 'my_cache',
            expiresIn: 10 * 1000,
            generateTimeout: 2000,
            getDecoratedValue: true
        }
    });

    server.route({
        path: '/add/{a}/{b}',
        method: 'GET',
        handler: async function (request, h) {

            const { a, b } = request.params;
            const { value, cached } = await server.methods.sum(a, b);
            const lastModified = cached ? new Date(cached.stored) : new Date();

            return h.response(value)
                .header('Last-modified', lastModified.toUTCString());
        }
    });

    await server.start();

};
```

You can find more details about `cached` and `report` in the [Catbox Policy API docs](https://github.com/hapijs/catbox#api-1).
