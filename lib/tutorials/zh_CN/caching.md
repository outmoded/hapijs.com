## 缓存

_该教程适用于 hapi v17版本_

### 客户端缓存

HTTP 协议定义了许多 HTTP 头部（headers）信息，方便如浏览器等客户端使用缓存资源。想要更多的了解这些信息，并决定哪些适用与你的用例，可以访问这里 [Google 指南](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)。

这份教程的第一部分展示了 hapi 如何简单的为客户端配置头部信息。

#### Cache-Control

`Cache-Control` header 控制缓存的条件以及可以缓存多久。 例如, `Cache-Control:max-age=30, must-revalidate, private` 意味这浏览器可以缓存相关的资源 30 秒，`private` 意味这资源只能被浏览器缓存而不是任何中间缓存，`must-revalidate` 意思是一旦过期客户端就必须向服务器重新请求资源。

让我们看一下 hapi 如何设置这个头部信息:

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

以上的例子显示了如何为路由设置 `cache` 选项。 这里我们设置 `expiresIn` 为 30 秒，以及 `privacy` 为私有。
该示例还说明了 `expiresIn` 值可以使用 [response 对象](/api#response-object) 接口提供的 `ttl(毫秒)`值改写。

如果我们向 `/hapi` 发出请求，我们将收到响应头信息 `cache-control: max-age=30, must-revalidate, private`。 如果我们发送请求 `/hapi/5000` 我们则收到响应头信息 `cache-control: max-age=5, must-revalidate, private`。

参考 [route-options](/api#route-options) 可以获得更多关于 `cache` 配置的信息。

#### Last-Modified

在一些情况中，服务器可以提供关于一个资源最后被修改的信息。当使用 [inert](https://github.com/hapijs/inert) 插件来处理静态内容时， 一个 `Last-Modified` header 将在每个响应中自动添加。

当响应中设置了 `Last-Modified` header 时, hapi 通过与客户端发来的 `If-Modified-Since` header 比较之后才来决定响应的返回码是否该为 `304 Not Modified`。 这个做法通常也被称之为条件 GET 请求，它的好处就是告知浏览器当收到一个 `304` 响应时，不需要重新去下载资源。

假设 `lastModified` 是一个 `Date` 对象，你可以通过 [response 对象](/api#response-object) 设置这个头部信息。

```javascript
return h.response(result)
    .header('Last-Modified', lastModified.toUTCString());
```
这个示例展示了使用 `Last-Modified` 在本教程的 [最后一节](#客户端和服务器端缓存) 中。

#### ETag

ETag header 是除 `Last-Modified` 之外的另一种选择。这里服务器将会提供一个令牌(token) (通常是资源的校验和) 来代替上次改动的时间戳。浏览器将会在下个请求中使用这个令牌去设置 `If-None-Match` header 信息。服务器将会拿这个头部的值与新 `ETag` 的校验和进行比较来决定要不要返回 `304` 响应。

在你的 handler 中你只需通过 `etag(tag, options)` 函数来设置 `ETag`:

```javascript
return h.response(result).etag('xxxxxxxxx');
```

关于 `etag` 的更多细节如参数和选项等信息，可以在[response 对象](/api#response-object) 中找到。

### 服务端缓存

hapi 通过 [catbox](https://www.github.com/hapijs/catbox) 提供强健易用的服务端缓存技术，这份教程接下来的部分将会告诉你如何使用 catbox。

Catbox有两个接口： client 和 policy。

#### Client

[Client](https://github.com/hapijs/catbox#client) 是一个低级别的接口，允许你设置和获取键值对。它通过以下可用的适配器来初始化: ([Memory](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), [mongoDB](https://github.com/hapijs/catbox-mongodb), [Memcached](https://github.com/hapijs/catbox-memcached), or [Riak](https://github.com/DanielBarnes/catbox-riak))。

hapi 通过 [catbox memory](https://github.com/hapijs/catbox-memory) 适配器来初始化一个默认的 [client](https://github.com/hapijs/catbox#client)。让我们看一下如何定义更多的 client。

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 8000,
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
```

在上面的例子中我们定义了两个 catbox client: mongoCache 与 redisCache。包括 hapi 默认创建的 memory catbox 在内，一共有三个可用的缓存 client。注册新的缓存 client时，可以通过省略 `name` 属性来替换默认的 client 。 `partition` 告诉适配器如何命名缓存( 默认为 'catbox')。在 [mongoDB](http://www.mongodb.org/) 这个值将变成数据库的名称，而在 [redis](http://redis.io/) 中它将会变成键的前缀。

#### Policy

[Policy](https://github.com/hapijs/catbox#policy) 是比 Client 更高一级别的接口。接下来展示了如何缓存两个数之和的例子，这个示例的原理也可以应用于其余的缓存情况。如函数的回调结果，async或者是别的内容。[server.cache(options)](/api#-servercacheoptions) 创建一个新的[policy](https://github.com/hapijs/catbox#policy), 这个可以在路由 handler 中使用。

```javascript
const start = async () => {

    const add = async (a, b) => {

        await Hoek.wait(1000);   // 模拟一些慢的 I/O 操作

        return Number(a) + Number(b);
    };

    const sumCache = server.cache({
        cache: 'mongoCache',
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
如果发送一个请求到 http://localhost:8000/add/1/5, 你将在一秒后得到一个响应 `6`。 如果你再次请求的时候，因为被缓存了，将会立刻得到结果。如果你等待10秒后再次请求, 你会发现它需要等待一段时间，因为缓存的值现在已从缓存中移除了。

`cache` 选项告诉 hapi 哪个 [client](https://github.com/hapijs/catbox#client) 该被使用。

`sumCache.get()` 函数的第一个参数是一个 id, 这可以为一个字符串或者一个拥有 `id` 属性的对象，这个属性是用来在缓存中标识对象。

除了 **分区(partitions)** 之外, 还有 **分段(segments)** ，它允许你在一个 [client](https://github.com/hapijs/catbox#client) 分区中进一步隔离缓存。如果需要缓存来自两种不同方法的结果，你通常不希望结果混在一起。在 [mongoDB](http://www.mongodb.org/) 适配器中, `segment` 代表一个集合，而在 [redis](http://redis.io/) 中它则是一个额外的拥有 `partition` 选项的前缀。

当在插件内部调用 [server.cache()](/api#-servercacheoptions) 时，`segment` 的默认值为 `'!pluginName'`。当创建[server methods](/tutorials/server-methods) 时, `segment` 值将会是 `'#methodName'`。 如果你需要一个用于共享一个分段或者多个分段的用例，可以使用 [shared](/api#-servercacheoptions) 选项。

#### 服务器方法

除此之外我们可以做的更好！在 95% 的情况下，可以通过使用 [server methods](/tutorials/server-methods) 进行缓存, 可以将样本代码减少到最小。让我们使用服务器方法重写前面的示例：

```javascript
const start = async () => {

    // ...

    server.method('sum', add, {
        cache: {
            cache: 'mongoCache',
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

    // ...
};

start();
```
[server.method()](/api#-servermethodname-method-options) 创建一个新的包含 `segment: '#sum'` 的 [policy](https://github.com/hapijs/catbox#policy)，以及通过参数自动生成的唯一的 `id` (缓存的键)。 默认来说它只处理 `string`， `number` 以及 `boolean` 参数。对于更复杂的参数，需要提供 `generateKey` 函数去创建一个基于参数的唯一id。  - 请参阅教程的这部分内容 [服务器方法](/tutorials/server-methods) 。

#### 接下来呢?

* 更深入的了解 catbox policy [options](https://github.com/hapijs/catbox#policy) ，了解更多关于 `staleIn`, `staleTimeout`, `generateTimeout`的信息, 以充分利用 catbox 缓存的潜力。
* 阅读服务器方法的教程 [服务器方法](http://hapijs.com/tutorials/server-methods) 了解更多示例。

### 客户端和服务器端缓存

通常作为可选项，[Catbox Policy](https://github.com/hapijs/catbox#policy) 可以提供从缓存中检索的值的更多信息。若要开启此选项，需要在创建 policy 时将  `getDecoratedValue` 的值设置为 true 。这样，从服务器方法返回的任何值都将是一个对象 `{ value, cached, report }`。 `value` 只是缓存中的项目, `cached` 和 `report` 提供了有关项目缓存状态的一些额外细节。

服务器端和客户端缓存协同工作的一个例子是使用 `cached.stored` 时间戳设置 `last-modified` 头信息来实现的：

```javascript
const start = async () => {

    //...

    server.method('sum', add, {
        cache: {
            cache: 'mongoCache',
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

    // ...
};
```

关于`cached` 和 `report` 的更多信息可以在 [Catbox Policy API docs](https://github.com/hapijs/catbox#api-1) 的文档中找到。
