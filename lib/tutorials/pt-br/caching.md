## Aramazenamento em cache no lado do cliente 

_Este tutorial é compativel com hapi v10.x.x._

O protocolo HTTP fornece várias cebeçalhos diferentes para controlar os recursos de cache do navegador. Para decidir quais cabeçalhos são validos para o seu caso de uso, varifique no Google developers [guide](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching) ou neste [resources](https://www.google.com/search?q=HTTP+caching). Este tutorial oferece uma visão geral de como usar estas técnicas com hapi.

### Cache-Control

O cabeçalho `Cache-Control` diz ao browser e a qualquer cache intermediário se um recurso é cacheavel e por quanto tempo. Por exemplo, `Cache-Control:max-age=30, must-revalidate, private` significa que o browser pode cachear os recursos associados por trinta segundos e `private` significa que não deve ser cacheado por caches intermediarios, somente pelo browser. `must-revalidate` significa que uma vez que expire tem de solicitar o recurso novamente para o servidor.

Vamos ver como nos podemos colocar estes cabeçalhos no hapi:

```javascript
server.route({
    path: '/hapi/{ttl?}',
    method: 'GET',
    handler: function (request, reply) {

        var response = reply({ be: 'hapi' });
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
**Listagem 1** Setar Cache-Control no cabeçalho

Na Listagem 1 ilustra que o valor `expiresIn` pode ser sobrescrito com o método `ttl(msec)` pelo [objeto de resposta](http://hapijs.com/api#response-object). 

Veja [route-options](http://hapijs.com/api#route-options) por mais informações sobre as opções de configuração comuns do `cache`. 

### Last-Modified

Em alguns casos o servidor pode fornecer informações de quando os recursos foram modificados pela última vez. Quando usar o plugin [inert](https://github.com/hapijs/inert) pase servir conteúdo estáticos, um cabeçalho `Last-Modified` é adicionado em toda carga de resposta.

Quando o cebeçalho `Last-Modified` é setado em um resposta, o hapi compare ele com o cabeçalho `If-Modified-Since` vindo pelo cliente para decidir se o código do status da resposta deve ser `304`. 

Assumindo que `lastModified` é um objeto do tipo Date, é possivel definir no cabeçalho via interface [objeto de resposta](http://hapijs.com/api#response-object) como pode ser visto abaixo, na Listagem 2.

```javascript
   reply(result).header('Last-Modified', lastModified.toUTCString());
```
**Listagem 2** Configurar Last-Modified no cabeçalho

Este é mais um exemplo usando `Last-Modified` na [última seção](#client-and-server-caching) deste tutorial.

### ETag

O cabeçalho ETag é uma alternativa para o `Last-Modified` qunado o servidor fornece um token (geralmente o checksum deste recurso) ao invés da últma timestamp de qunado foi modificação. O browser irá usar este token para setar o cabeçalho `If-None-Match` na próxima requisição. O servidor compara os valores do cebeçalhos com a nova `ETag` checksum e responde com `304` se eles são iguais.

Você só precisa definir `ETag` no seu manipulador com a função `etag(tag, options)`:

```javascript
   reply(result).etag('xxxxxxxxx');
```
**Listagem 3** Configurar ETag no cabeçalho

Verificar o documento da `etag` no [objeto de resposta](http://hapijs.com/api#response-object) para mais detalhes sobre os parâmetros e as opções desponíveis.

## Cacheando no lado do servidor

hapi fornece um sistema de cache poderoso do lado do servidor via [catbox](https://www.github.com/hapijs/catbox) e torna o uso do cache bem mais confiavel. Este seção do tutorial vai  ajudar você a entender como o catbox é utilizado dentro do hapi e como você pode influênciar nele.

Catbox tem duas interfaces; client e policy.

### Cliente

[Client](https://github.com/hapijs/catbox#client) é um interface de baixo nível que permite você setar/pegar pares de chave-valor. Este é inicializado com um dos adaptadores disponíveis: ([Memory](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), [mongoDB](https://github.com/hapijs/catbox-mongodb), [Memcached](https://github.com/hapijs/catbox-memcached), ou [Riak](https://github.com/DanielBarnes/catbox-riak)).

hapi sempre incializa com um [client](http://github.com/hapijs/catbox#client) padrão com o adaptador [memory](https://github.com/hapijs/catbox-memory). Vamos ver como nos podemos definir mais clients.

```javascript
var Hapi = require('hapi');

var server = new Hapi.Server({
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
**Listagem 4** Definindo catbox clients

Na Listagem 4, nós definimos 2 catbox clients; mongoCache e redisCache. Incluindo o memory cache padrão criada pelo hapi, existem três cliente de cache disponivel. Você pode replicar o cliente padrão por omitindo a propriedade `name` quando estiver registrando o novo cliente de cache. `partition` diz ao adaptador como o cache deve ser nomeado ('catbox' por padrão). Em caso de [mongoDB](http://www.mongodb.org) é o nome do banco de dados, em caso de [redis](http://redis.io/) é usado o prefixo da chave.

### Policy

[Policy](https://github.com/hapijs/catbox#policy) é um inteface de mais baixo nível do que o Cliente. Vamos fingir que nós estemos lidando com algo mais complicado do que somar dois números e queremos cachear os resultados. [server.cache](http://hapijs.com/api#servercacheoptions) cria uma nova [policy](https://gihub.com/hapijs/catbox#policy), que irá ser usada na manipulação de rota.

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
    },
    generateTimeout: 100
});

server.route({
    path: '/add/{a}/{b}',
    method: 'GET',
    handler: function (request, reply) {

        var id = request.params.a + ':' + request.params.b;
        sumCache.get({ id: id, a: request.params.a, b: request.params.b }, function (err, result) {

            reply(result);
        });
    }
});
```
**Listagem 5** Usando `server.cache`

`cache` diz ao hapi como user o [client](https://github.com/hapijs/catbox#client)

O primeiro parâmeto da função `sumCache.get` é um objeto com uma chave obrigatória `id`, que é uma string única de identificação do item.

Além de **partições**, tem **segmentos** que permite você isolar os caches sem um [client](https://github.com/hapids/catbox#client). Se você deseja armazernar o resultado em cache por dois firentes métodos, você geralmente não vai querer misturar os resultados juntos. No adaptador [mongoDB](http://www.mongodb.org), `segment` representa uma colcação e no [redis](http://redis.io/) isto é um prefixo adiciona, juntamento com a opção `partition`.

O valor padrão para `segment` quando [server.cache](http://hapijs.com/api#servercacheoptions) é chamado dentro de um plugin será `'!pluginName'`. Ao criar [server methods](http://hapijs.com/tutorials/server-methods), o valor do `segment` será `'#methodName'`. Se você tiver usando em um caso várias policies que compartilham um segment exite uma opção [shared](http://hapijs.com/api#servercacheoptions) disponível também.

### Métodos de servidor

Mas ele pode ficar melhor que isto! Em 95% dos casos você pode user [server methods](http://hapijs.com/tutorials/server-methods) para fins de armazenamento em cache, porque isso reduz a padronização para o minimo. Vamos reescrever a Listagem 5 usando os métodos do servidor:

```javascript
var add = function (a, b, next) {

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

        server.methods.sum(request.params.a, request.params.b, function (err, result) {

            reply(result);
        });
    }
});
```
**Listagem 6** Usando cache via métodos do servidor

[server.method()](http://hapijs.com/api#servermethodname-method-options) cria uma nova [policy](https://github.com/hapijs/catbox#policy) com `segment: '#sum'` automaticamente para nós. Além disso, o único item `id` (chave do cache) esta gerda automaticamente a partir dos parâmetros. Por padrão, ele lida com parâmetros do tipo `string`, `number` e `boolean`. Para parâmetros mais complexos, você tem que fornecer sua próprio função `generateKey` para criar os ids único baseado nos parêmetros - confira os métodos do servidor [tutorial](http://hapijs.com/tutorials/server-methods) para mais informações.

### Qual a próxima?

* De uma olhada melhor em catbox policy [options](https://github.com/hapijs/catbox#policy) e preste bastante atenção em `staleIn`, `staleTimeout`, `generateTimeout`, que aproveita todo o potencial do armazenamento em cache do catbox.
* Varifique os métodos do servidor [tutorial](http://hapijs.com/tutorials/server-methods) para mais exemplos.

## Caheando no lado do cliente e servidor.

[Catbox Policy](https://github.com/hapijs/catbox#policy) fornece mais dois parâmetros `cached` e `report` que fornece alguns detalhes quando um item é armazenado

Neste caso nós usamos `cached.stored` timestamp para adicionar no header `last-modified`.

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
**Listagem 7** Cacheando no lado do servidor e cliente juntos
