## 클라이언트쪽 캐싱

_이 튜터리얼은 hapi v11.x.x와 호환됩니다._

HTTP 프로토콜은 브라우저가 자원을 캐시 하는 방법을 제어하는 몇 개의 다른 HTTP 헤더를 제공합니다. 사용 사례에 맞는 헤더를 선택하려면 구글 개발자 [가이드](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching) 또는 다른 [자료](https://www.google.com/search?q=HTTP+caching)를 확인하세요. 이 튜터리얼은 그 기술을 hapi와 사용하는 방법을 개괄적으로 설명합니다.

### Cache-Control

`Cache-Control` 헤더는 자원이 캐시 가능 여부와 캐시 기간을 브라우저와 중간 캐시에 알려줍니다. 예를 들어 `Cache-Control:max-age=30, must-revalidate, private`은 브라우저는 관련된 자원을 30초 동안 캐시 할 수 있음을 의미하고 `private`는 브라우저 외에 다른 중간 캐시에서는 캐시 될 수 없음을 의미합니다. `must-revalidate`는 시간이 만료되면 서버에 다시 자원을 요청해야 하는 것을 의미합니다.

hapi에서 이 헤더를 어떻게 설정하는지 보겠습니다.:

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
    options: {
        cache: {
            expiresIn: 30 * 1000,
            privacy: 'private'
        }
    }
});
```
**목록 1** Cache-Control 헤더 설정하기

목록 1은 `expiresIn` 값이 [response 객체](http://hapijs.com/api#response-object)의 `ttl(msec)` 메소드로 덮일 수 있음을 보여줍니다

일반적인 `cache` 설정 옵션에 대한 자세한 정보는 [route-options](http://hapijs.com/api#route-options)을 봐 주세요.

### Last-Modified

때에 따라 서버가 자원이 마지막으로 수정된 시간 정보를 제공할 수 있습니다. 정적 콘텐츠를 제공하는 [inert](https://github.com/hapijs/inert) 플러그인을 사용할 때, 모든 응답 페이로드에 `Last-Modified` 헤더가 추가됩니다.

hapi는 응답의 `Last-Modified` 헤더에 설정된 시간과 클라이언트에게서 오는 `If-Modified-Since` 헤더의 시간을 비교하여 응답 상태 코드가 `304`가 될지 결정합니다.

`lastModifed`가 Date 객체라고 가정하고 응답 객체를 목록 2에서처럼 [response 객체](http://hapijs.com/api#response-object)를 통해 헤더를 설정할 수 있습니다.

```javascript
   reply(result).header('Last-Modified', lastModified.toUTCString());
```
**목록 2** Last-Modified 헤더 설정하기

이 튜터리얼의 [마지막 절](#client-and-server-caching)에 `Last-Modified`를 사용한 또 다른 예제가 있습니다.

### ETag

ETag 헤더는 마지막 수정된 시간 대신 서버가 제공하는 토큰(보통 자원의 체크섬)으로 `Last-Modified`의 대안입니다. 브라우저는 다음 요청의 `If-None-Match` 헤더를 설정할 때 이 토큰을 합니다. 서버는 이 헤더의 값과 새로운 `ETag` 체크섬을 비교하여 같은 값이면 `304`로 응답합니다.

`etag(tag, options)` 함수로 `ETag`를 설정하기만 하면 됩니다.:

```javascript
   reply(result).etag('xxxxxxxxx');
```
**목록 3** ETag 헤더 설정하기

인자와 가능한 옵션에 대한 더 자세한 내용은 [response 객체](http://hapijs.com/api#response-object)에서 `etag` 문서를 확인하세요.

## 서버 쪽 캐싱

hapi는 [catbox](https://www.github.com/hapijs/catbox)을 통해 강력한 서버 쪽 캐싱을 제공하고 캐시 사용을 매우 편리하게 만듭니다. 튜터리얼의 이 절은 catbox가 hapi 내부에서 어떻게 활용되고 어떻게 활용할 것인지 이해하는 데 도움이 될 것입니다.

Catbox는 두 개의 인터페이스를 가지고 있습니다; client와 policy.

### Client

[Client](https://github.com/hapijs/catbox#client)는 키-값 쌍을 설정 / 가져올 수 있는 저수준 인터페이스입니다. 사용가능한 어댑터로 초기화 됩니다: ([Memory](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), [mongoDB](https://github.com/hapijs/catbox-mongodb), [Memcached](https://github.com/hapijs/catbox-memcached), [Riak](https://github.com/DanielBarnes/catbox-riak))

hapi는 [memory](https://github.com/hapijs/catbox-memory) 어댑터로 하나의 기본 [client](https://github.com/hapijs/catbox#client)를 항상 초기화합니다.

```javascript
'use strict';

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
**목록 4** catbox client 정의하기

목록 4에서 두 개의 catbox client를 정의했습니다.; mongoCache와 redisCache. hapi가 생성한 기본 메모리 캐시를 포함하여 총 3개의 가능한 캐시 client가 있습니다. 새로운 캐시 client를 등록할 때 `name` 속성을 생략하면 기본 client를 교체할 수 있습니다. `partition`은 어댑터에 캐시 이름을 알려줍니다. (기본은 `catbox`) [mongoDB](http://www.mongodb.org/)의 경우 데이터베이스 이름이고 [redis](http://redis.io/)의 경우 키의 접두사로 사용됩니다.

### Policy

[Policy](https://github.com/hapijs/catbox#policy)는 client 보다 고수준 인터페이스입니다. 두 숫자를 더하는 것보다 더 복잡한 것을 다룰 것이고 그 결과를 캐시하기를 원합니다. [server.cache](http://hapijs.com/api#servercacheoptions)는 새로운 [policy](https://github.com/hapijs/catbox#policy)를 생성하고 경로 처리기에서 사용됩니다.

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

            if (err) {
                return reply(err);
            }
            reply(result);
        });
    }
});
```
**목록 5** `server.cache` 사용하기

`cache`는 hapi에게 사용할 [client](https://github.com/hapijs/catbox#client)를 알려줍니다.

`sumCache.get` 함수의 첫 번째 인자는 고유한 항목 식별자 문자열인 필수 키 `id`를 가진 객체이다.

**partitions**외에도 하나의 [client](https://github.com/hapijs/catbox#client)에서 캐시를 격리할 수 있는 **segments**가 있습니다. 두 개의 다른 메소드로부터의 결과를 캐시 하려고 할 때 보통 그 결과를 같이 섞이는 것을 원하지 않을 것입니다.  [mongoDB](http://www.mongodb.org/) 어댑터에서 `segment`는 collection을 의미하고 [redis](http://redis.io/)에서는 `partition` 옵션과 함께 추가 접두사입니다

플러그인 안에서 [server.cache](http://hapijs.com/api#servercacheoptions)가 호출될 때 `segment`의 기본값은 `'!pluginName'`입니다. [server methods](http://hapijs.com/tutorials/server-methods)를 만들 때 `segment`의 값은 `'#mothodName'`입니다. 여러 policy에서 하나의 segment를 공유하려는 여러 policy가 있는 경우라면 [shared](http://hapijs.com/api#servercacheoptions) 옵션을 사용할 수 있습니다.

### 서버 메소드

더 좋아질 수 있습니다! 보일러 플레이트가 최소로 줄어들기 때문에 95% 경우 캐싱 목적으로 [server methods](http://hapijs.com/tutorials/server-methods)을 사용할 것입니다. 서버 메소드를 사용하여 목록 5를 다시 작성합니다.:

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

            if (err) {
                return reply(err);
            }
            reply(result);
        });
    }
});
```
**목록 6** 서버 메소드로 캐시 사용하기

[server.method()](http://hapijs.com/api#servermethodname-method-options)는 `segment: '#sum'`과 함께 자동으로 새로운 [policy](https://github.com/hapijs/catbox#policy)를 만듭니다. 또한, 고유 항목 `id`(캐시 키)는 인자로부터 자동으로 생성됩니다. 기본으로 `string`, `number`, `boolean` 인자를 받습니다. 더 복잡한 인자들은 인자를 기반으로 고유한 식별자를 만드는 `generateKey` 함수를 제공해야 합니다. - 더 자세한 내용은 서버 메소드 [tutorial](http://hapijs.com/tutorials/server-methods)에서 확인하세요.

### 다음은?

* catbox policy [options](https://github.com/hapijs/catbox#policy)을 살펴보고 catbox 캐싱의 모든 잠재력을 활용하기 위해 `staleIn`, `staleTimeout`, `generateTimeout`에 각별한 주의를 기울여주세요.
* 많은 예제는 서버 메소드 [tutorial](http://hapijs.com/tutorials/server-methods)을 확인하세요.

## 클라이언트와 서버 캐싱

[Catbox Policy](https://github.com/hapijs/catbox#policy)는 항목이 캐시될 때 자세한 정보를 제공하는 `cached`, `report` 두 개의 인자를 더 제공합니다.

이 예에서 `cached.stored` 시간으로 `last-modified` 헤더를 설정합니다.

```javascript
server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        server.methods.sum(request.params.a, request.params.b, (err, result, cached, report) => {

            if (err) {
                return reply(err);
            }
            const lastModified = cached ? new Date(cached.stored) : new Date();
            return reply(result).header('last-modified', lastModified.toUTCString());
        });
    }
});
```
**목록 7** 같이 사용되는 서버와 클라이언트 쪽 캐싱
