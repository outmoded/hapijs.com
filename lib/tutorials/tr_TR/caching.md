## Önbellekleme

_Bu kurs hapi v17 ile uyumludur_

### Istemci taraflı önbellekleme

HTTP protokolü, tarayıcı ve benzeri istemcilerin kaynakları önbelleklemeleri için bazı HTTP başlıkları tayin eder. Bu başlıklar hakkında daha fazla bilgi edinmek ve kullanım senaryona hangisinin yatkın olduğuna karar vermek için [Google tarafından oluşturulan bu rehbere](https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching) bir göz at.

Bu öğreticinin ilk bölümü, hapinin istemcilere bu başlıkları göndermek üzere nasıl yapılandırılacağını gösterir.

#### Cache-Control

`Cache-Control` başlığı tarayıcıya ve tüm ara önbelleklere bir kaynağın önbelleklenebilir olup olmadığını ve eğer öyleyse ne kadar süre önbelleklenmesi gerektiğini söyler. Örneğin, `Cache-Control:max-age=30, must-revalidate, private` ilgili kaynağın tarayıcı tarafından otuz saniye boyunca önbelleklenebileceğini ve `private` ara önbellekler tarafından değil yalnızca tarayıcı tarafından önbelleklenmesi gerektiği söyler. `must-revalidate` önbellek süresi dolduğunda sunucudan kaynağın yenisinin istenmesi gerektiği anlamına gelir.

Hadi bu başlığı hapi ile nasıl ayarlayabileceğimize bakalım:

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

Yukarıdaki örnek bir yol (route) üzerinde nasıl `cache` seçeneklerini ayarlayabileceğini gösteriyor. Burada `expiresIn` değerini 30 saniye ve `privacy` değerini `private` olarak ayarladık.

Bu örnek aynı zamanda `expiresIn` değerinin  üzerine [yanıt nesnesi](/api#response-object) arayüzünde bulunan `ttl(msec)` yöntemi ile yazılabileceğini gösteriyor.

`/hapi`ye bir istekte bulunursak yanıt başlığı olarak `cache-control: max-age=30, must-revalidate, private` alırız. Eper isteği `/hapi/5000`e yaparsak bunun yerine şu başlık gelir: `cache-control: max-age=5, must-revalidate, private`.

[yol-secenekleri (route options)](/api#route-options) bağlantısından daha fazla genel `cache` yapılandırma seçeneği bulabilirsin.

#### Last-Modified

Bazı durumlarda, sunucu bir kaynağın son düzenlendiği tarihi sağlayabilir. Durağan içerikler sunmak için [inert](https://github.com/hapijs/inert) eklentisini kullanırken otomatik olarak her yanıta `Last-Modified` başlığı eklenir.


Bir yanıtta `Last-Modified` başlığı ayarlandığında hapi bu bilgiyi istemciden gelen `If-Modified-Since` başlığıyla karşılaştırarak yanıt durum kodunun `304 Not Modified` olup olmayacağına karar verir. Bu olay anı zamanda koşullu GET isteği olarak da bilinir. Bu yanıtın güzel tarafı, `304` yanıtı alan tarayıcının aynı içeriği tekrar indirmesine gerek kalmamasıdır.


`lastModified` bilgsinin bir `Date` nesnesi olduğunu varsayarsak bu başlığı [yanıt nesnesi (response object)](/api#response-object) kullanarak şu şekilde ayarlayabilirsin:

```javascript
return h.response(result)
    .header('Last-Modified', lastModified.toUTCString());
```
Bu yazının [son bölümünde](#istemci-ve-sunucu-önbellekleme) `Last-Modified` kullanan bir örnek daha var.

#### ETag

ETag, zaman damgası paylaşan `Last-Modified` başlığına alternatif olarak sunucunun bir jeton (genellikle kaynağın sağlama toplamı (checksum)) paylaştığı başlıktır. Tarayıcı bu jetonu bir sonraki isteğinde `If-None-Match` başlığını ayarlamak için kullanır. Sunucu bu başlığın değerini güncel `ETag` sağlama toplamıyla karşılaştırarak aynı ise `304` döner.

Başlığınızda `ETag` kullanmak için yalnızca `etag(tag, options)` işlevini kullanman yeterli:

```javascript
return h.response(result).etag('xxxxxxxxx');
```

Kullanılabilecek daha fazla argüman ve seçenek için [yanıt nesnesi (response object)](/api#response-object) altında bulunan `etag` dokümantasyonuna bir göz at.

### Sunucu taraflı önbellekleme

hapi [catbox](https://www.github.com/hapijs/catbox) ile güçlü ve pratik sunucu taraflı önbellekleme sunar. Bu öğretici bölümü catboxı nasıl kullanman gerektiğini anlamana yardımcı olacak.

Catboxın iki arayüzü bulunur: istemci (client) ve politika (policy).

#### Client (Istemci)

[İstemci (client)](https://github.com/hapijs/catbox#client) anahtar-değer eşleri alıp-verebileceğin alt seviye bir arayüzdür. Şu adaptörlerden birisi ile başlatılır: ([Hafıza (memory)](https://github.com/hapijs/catbox-memory), [Redis](https://github.com/hapijs/catbox-redis), [mongoDB](https://github.com/hapijs/catbox-mongodb), [Memcached](https://github.com/hapijs/catbox-memcached), or [Riak](https://github.com/DanielBarnes/catbox-riak)).

hapi varsayılan olarak [catbox memory](https://github.com/hapijs/catbox-memory) adaptörünü kullanarak bir [İstemci (client)](https://github.com/hapijs/catbox#client) başlatır. Nasıl daha fazla istemci başlatacağına bir bakalım:

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

Yukarıdaki örnekte, iki tane catbox istemcisi tanımladık: mongoCache ve redisCache. hapi tarafından oluşturulan hafıza önbelleğini de sayarsak üç tane önbellek istemcisi oldu. Yeni bir önbellek istemcisi tanımlarken `name` özelliğini es geçerek varsayılan istemciyi değiştirebilirsin. `partition` adaptöre önbelleğin nasıl adlandırılacağini söyler (varsayılan olarak 'catbox'). [mongoDB](http://www.mongodb.org/)de bu veritabanı adı ve [redis](http://redis.io/)te anahtar ön eki olarak karşımıza çıkar.

#### Policy (Politika)

[Politika (policy)](https://github.com/hapijs/catbox#policy) istemciye nazaran daha üst seviye bir arayüzdür. Aşağıda iki sayıyı birbirine ekleyip sonucu önbellekleyen basit bir örnek bulunuyor. Bu basit örneğin ortaya koyduğu prensipleri kullanarak bir fonksiyon çağrısının sonucunu, asenkron olsun olmasın önbellekleyebilirsin. [server.cache(options)](/api#-servercacheoptions) daha sonra yol işleyici (route handler) tarafından kullanılmak üzere yeni bir [politika (policy)](https://github.com/hapijs/catbox#policy) oluşturur.

```javascript
const start = async () => {

    const add = async (a, b) => {

        await Hoek.wait(1000);   // Yavaş I/O simülasyonu

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

Eğer http://localhost:8000/add/1/5 adresine bir istekte bulunursan bir saniye sonra `6` yanıtı almalısın. İsteği tekrarlarsan sonuç anında gelir çünkü bu kez sonuç önbellek tarafından sunulmaktadır. Eğer on saniye bekleyip isteği tekrar etseydin yine biraz beklediğini görecektin çünkü önbellek değeri önbellekten silinmiş olacaktı.

`cache` seçeneği hapiye hangi [istemci (client)](https://github.com/hapijs/catbox#client)yi kullanacağını söyler.

`sumCache.get()` işlevinin ilk değiştirgesi `id` olarak kullanılmak üzere bir metin ya da içerisinde tekil tanımlayıcı olarak kullanılmak üzere `id` özelliği olan bir nesne olabilir.

**partitionlar**a ek olarak, bir [istemci (client)](https://github.com/hapijs/catbox#client) bölmelendirmesi içerisinde daha fazla izolasyon sağlayacak **segmentler** var. İki farklı yöntem sonucunu önbelleklemek istersen genelde bunları birbirine karıştırmak istemezsin. [mongoDB](http://www.mongodb.org/) adaptörlerinde `segment` bir koleksiyonu temsil ederken, [redis](http://redis.io/)te `partition` için eklenen öneke ek olarak eklenen bir önektir.

Bir eklenti içerisinden [server.cache()](/api#-servercacheoptions) çağırıldığında `segment`in varsayılan değeri `'!pluginName'` olur. [Sunucu yöntemleri (server methods)](/tutorials/server-methods) oluştururken `segment` değeri `'#methodName'` olur. Eğer bir segmenti paylaşan birden fazla politikanın olduğu bir durum varsa, bunun için de [paylasılan (shared)](/api#-servercacheoptions) seçeneği mevcut.

#### Sunucu Yöntemi

Daha iyi olabilir! Yüzde doksan beş ihtimal önbellekleme için [sunucu yöntemleri (server methods)](/tutorials/server-methods)ni kullanacaksın çünkü daha az basmakalıp kullanmak gerekiyor. Hadi önceki örneği sunucu yöntemi ile tekrar yazalım:

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
[server.method()](/api#-servermethodname-method-options) otomatik olarak `segment: '#sum'` kesitiyle yeni bir [politika (policy)](https://github.com/hapijs/catbox#policy) oluşturdu. Ayrıca değiştirgelerle tekil bir `id` (önbellek anahtarı) de oluşturuldu. Varsayılan olarak, `string`, `number` ve `boolean` değiştirgelerle çalışabilir. Daha kompleks değiştirgeler için değiştirgeleri kullanarak nasıl tekil tanımlayıcılar üretileceğini belirleyen bir `generateKey` işlevi tanımlamalısın. - [Sunucu yöntemleri](/tutorials/server-methods) öğreticisinden daha fazla bilgi alabilirsin.

#### Sırada ne var?

* catbox politikasının [seçenekler](https://github.com/hapijs/catbox#policy)inin içine bak ve catbox önbelleklemenin tüm potansiyelinden faydalanmak için `staleIn`, `staleTimeout`, `generateTimeout` kısımlarına özellikle dikkat et.
* Daha fazla örnek için [sunucu yöntemleri (server methods)](http://hapijs.com/tutorials/server-methods) öğreticisine göz at.

### Istemci ve Sunucu önbellekleme

İsteğe bağlı olarak, [Carbox Politikası (Catbox Policy)](https://github.com/hapijs/catbox#policy) önbellekten döndürülen değer hakkında daha fazla bilgi verebilir. Bunun için politikayı yaratırken `getDecoratedValue` seçeneğini true olarak ayarla. Bu şekilde sunucu yönteminden dönen tüm değerler `{ value, cached, report }` şeklinde birer nesne olur. `value` önbellekten dönen değeri barındırırken, `cached` ve `report` değerim önbellek durumu hakkında daha fazla bilgi sunar.

`cached.stored` zaman damgasının `last-modified` başlığını ayarlamak için kullanılması güzel bir beraber çalışan sunucu taraflı-istemci taraflı önbellekleme örneğidir.

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

`cached` ve `report` hakkında daha fazlasını [Catbox Politika API dokümanları (Catbox Policy API docs)](https://github.com/hapijs/catbox#api-1)nda bulabilirsin.
