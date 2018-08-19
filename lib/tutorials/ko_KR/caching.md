## Caching

_이 튜터리얼은 hapi v17과 호환됩니다._

### 클라이언트 쪽 캐싱

HTTP 프로토콜은 브라우저 같은 클라이언트가 자원을 캐시하는 방법을 가르치는 몇 가지 HTTP 헤더를 정의합니다. 이 헤더에 대해 자세히 알아보고 사용 사례가 적합한 것인지 결정하려면 유용한 [구글에서 작성한 가이드](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching)를 확인하세요.

이 튜터리얼의 첫 부분은 클라이어트에게 이 헤더들을 전송하기 위해 hapi를 쉽게 설정하는 방법을 보여줍니다.

#### Cache-Control

`Cache-Control` 헤더는 자원이 캐시 가능 여부와 캐시 기간을 브라우저와 중간 캐시에 알려줍니다. 예를 들어 `Cache-Control:max-age=30, must-revalidate, private`은 브라우저는 관련된 자원을 30초 동안 캐시 할 수 있음을 의미하고 `private`는 브라우저 외에 다른 중간 캐시에서는 캐시 될 수 없음을 의미합니다. `must-revalidate`는 시간이 만료되면 서버에 다시 자원을 요청해야 하는 것을 의미합니다. 

hapi에서 이 헤더를 어떻게 설정하는지 보겠습니다.:

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

위 예제는 경로에서 `cache` 옵션 객체를 설정하는 방법을 보여줍니다. `expiresIn`을 30초로 설정하고 `privacy`를 private로 설정합니다.
이 예제는 또한 `expiresIn` 값이 [response 객체](/api#response-object) 인터페이스에서 제공하는 `ttl(msec)` 메소드로 덮여질 수 있음을 보여줍니다.

`/hapi`에 요청하면 응답 헤더 `cache-control: max-age=30, must-revalidate, private`를 받을 것입니다. `/hapi/5000`에 요청하면 대신 응답 헤더 `cache-control: max-age=5, must-revalidate, private`를 받을 것입니다. 

공통적인 `cache` 설정 옵션에 대한 자세한 정보는 [route-options](/api#route-options)을 참고하세.

#### Last-Modified

때에 따라 서버가 자원이 마지막으로 수정된 시간 정보를 제공할 수 있습니다. 정적 콘텐츠를 제공하는 [inert](https://github.com/hapijs/inert) 플러그인을 사용할 때, 모든 응답 페이로드에 `Last-Modified` 헤더가 추가됩니다.

응답에 `Last-Modified` 헤더가 설정되었을 때, hapi는 응답의 `Last-Modified` 헤더에 설정된 시간과 클라이언트에게서 오는 `If-Modified-Since` 헤더의 시간을 비교하여 응답 상태 코드가 `304`가 될지 결정합니다. 이를 조건부 GET 요청이라고 합니다. 장점은 304응답에 대해 브라우저가 다시 파일을 내려받을 필요가 없습니다.

`lastModifed`가 Date 객체라고 가정하고 다음처럼 [response 객체](/api#response-object)를 통해 헤더를 설정할 수 있습니다.

```javascript
return h.response(result)
    .header('Last-Modified', lastModified.toUTCString());
```
이 튜터리얼의 [마지막 절](#client-and-server-caching)에 `Last-Modified`를 사용한 또 다른 예제가 있습니다.

#### ETag

ETag 헤더는 마지막 수정된 시간 대신 서버가 제공하는 토큰(보통 자원의 체크섬)으로 `Last-Modified`의 대안입니다. 브라우저는 다음 요청의 `If-None-Match` 헤더를 설정할 때 이 토큰을 합니다. 서버는 이 헤더의 값과 새로운 `ETag` 체크섬을 비교하여 같은 값이면 `304`로 응답합니다.

`etag(tag, options)` 함수로 `ETag`를 설정하기만 하면 됩니다.: 

```javascript
return h.response(result).etag('xxxxxxxxx');
```

인자와 가능한 옵션에 대한 더 자세한 내용은 [response 객체](/api#response-object)에서 `etag` 문서를 확인하세요.

### 서버 쪽 캐싱

hapi는 [catbox](https://www.github.com/hapijs/catbox)을 통해 강력한 서버 쪽 캐싱을 제공하고 캐시 사용을 매우 편리하게 만듭니다. 튜터리얼의 이 절은 catbox가 hapi 내부에서 어떻게 활용되고 어떻게 활용할 것인지 이해하는 데 도움이 될 것입니다. 

Catbox는 두 개의 인터페이스를 가지고 있습니다; client와 policy.

#### Client


[Client](https://github.com/hapijs/catbox#client)는 키-값 쌍을 설정 / 가져올 수 있는 저수준 인터페이스입니다. 사용가능한 어댑터로 초기화 됩니다:  ([Memory](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), [mongoDB](https://github.com/hapijs/catbox-mongodb), [Memcached](https://github.com/hapijs/catbox-memcached), or [Riak](https://github.com/DanielBarnes/catbox-riak))

hapi는 [catbox_memory](https://github.com/hapijs/catbox-memory) 어댑터를 사용하여 기본으로 [client](https://github.com/hapijs/catbox#client)를 초기화합니다. 여러 클라이언트를 정의하는 방법을 보겠습니다.

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

위 예제에서 두 개의 catbox client를 정의했습니다.; mongoCache와 redisCache. hapi가 생성한 기본 메모리 캐시를 포함하여 총 3개의 가능한 캐시 client가 있습니다. 새로운 캐시 client를 등록할 때 `name` 속성을 생략하면 기본 client를 교체할 수 있습니다. `partition`은 어댑터에 캐시 이름을 알려줍니다. (기본은 `catbox`) [mongoDB](http://www.mongodb.org/)의 경우 데이터베이스 이름이고 [redis](http://redis.io/)의 경우 키의 접두사로 사용됩니다.

#### Policy

[Policy](https://github.com/hapijs/catbox#policy)는 client 보다 고수준 인터페이스입니다. 다음은 두 숫자를 더한 결과를 캐싱하는 간단한 예제입니다. 이 간단한 예제의 원리는 함수, async 또는 다른 결과를 캐시하는 다른 상황에도 적용될 수 있습니다. [server.cache(options)](/api#servercacheoptions)는 새로운 [policy](https://github.com/hapijs/catbox#policy)를 생성하고 경로 처리기에서 사용됩니다.

```javascript
const start = async () => {

    const add = async (a, b) => {

        await Hoek.wait(1000);   // Simulate some slow I/O

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
http://localhost:8000/add/1/5 에 요청하면 1초 뒤에 응답 `6`을 받을 것입니다. 다시 요청하면 캐시에서 제공되기 때문에 응답을 즉시 받을 것입니다. 10초를 기다린 후, 다시 요청하면 캐시에서 제거되었기 때문에 시간이 좀더 걸리는 것을 볼 수 있습니다. 

`cache` 옵션은 hapi에 사용할 [client](https://github.com/hapijs/catbox#client)를 알려줍니다.

`sumCache.get` 함수의 첫 번째 인자는 고유한 항목 식별자인 문자열 또는 필수 속성 `id`를 가진 객체이다.

**partitions**외에도 하나의 [client](https://github.com/hapijs/catbox#client)에서 캐시를 격리할 수 있는 **segments**가 있습니다. 두 개의 다른 메소드로부터의 결과를 캐시 하려고 할 때 보통 그 결과를 같이 섞이는 것을 원하지 않을 것입니다.  [mongoDB](http://www.mongodb.org/) 어댑터에서 `segment`는 collection을 의미하고 [redis](http://redis.io/)에서는 `partition` 옵션과 함께 추가 접두사입니다

플러그인 안에서 [server.cache()](/api#servercacheoptions)가 호출될 때 `segment`의 기본값은 `'!pluginName'`입니다. [server methods](http://hapijs.com/tutorials/server-methods)를 만들 때 `segment`의 값은 `'#mothodName'`입니다. 여러 policy에서 하나의 segment를 공유하려는 여러 policy가 있는 경우라면 [shared](http://hapijs.com/api#servercacheoptions) 옵션을 사용할 수 있습니다.

#### 서버 메소드

더 좋아질 수 있습니다! 보일러 플레이트가 최소로 줄어들기 때문에 95% 경우 캐싱 목적으로 [server methods](/tutorials/server-methods)을 사용할 것입니다. 서버 메소드를 사용하여 앞의 예제를 다시 작성합니다.: 

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
[server.method()](/api#servermethodname-method-options)는 `segment: '#sum'`과 함께 자동으로 새로운 [policy](https://github.com/hapijs/catbox#policy)를 만듭니다. 또한, 고유 항목 `id`(캐시 키)는 인자로부터 자동으로 생성됩니다. 기본으로 `string`, `number`, `boolean` 인자를 받습니다. 더 복잡한 인자들은 인자를 기반으로 고유한 식별자를 만드는 `generateKey` 함수를 제공해야 합니다. - 더 자세한 내용은 서버 메소드 [tutorial](/tutorials/server-methods)에서 확인하세요.

#### 다음은?

* catbox policy [options](https://github.com/hapijs/catbox#policy)을 살펴보고 catbox 캐싱의 모든 잠재력을 활용하기 위해 `staleIn`, `staleTimeout`, `generateTimeout`에 각별한 주의를 기울여주세요.
* 많은 예제는 서버 메소드 [tutorial](http://hapijs.com/tutorials/server-methods)을 확인하세요.

### 클라이언트와 서버 캐싱

선택적으로 [Catbox Policy](https://github.com/hapijs/catbox#policy)는 캐시로부터 받은 값에 대해 자세한 정보를 제공할 수 있습니다. 이 기능을 사용하려면 policy를 생성할 때 `getDecoratedValue` 옵션을 true로 설정하세요. 서버 메소드가 반환한 값은 `{ value, cached, report }` 객체가 될 것입니다. `value`는 캐시에서 꺼낸 항목이고, `cached`와 `report`는 이 항목의 캐시 상태에 대한 몇 가지 추가 정보를 제공합니다.

서버 쪽과 클라이언트 쪽 캐싱이 같이 동작하는 예제에서 `cached.stored` 시간으로 `last-modified` 헤더를 설정합니다.

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

`cached`와 `report`에 대한 자세한 정보는 [Catbox Policy API docs](https://github.com/hapijs/catbox#api-1)에서 확인할 수 있습니다.
