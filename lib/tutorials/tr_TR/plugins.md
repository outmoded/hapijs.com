## Eklentiler

_Bu kurs hapi v17 ile uyumludur_

hapinin uygulamanı kolayca ayrıştırılmış (isolated) işletme mantığı ve tekrar kullanılabilir hizmetlere bölebileceğin kapsamlı ve güçlü bir eklenti sistemi bulunur.

## Bir eklenti oluşturmak

Eklenti yazmak çok kolay. Aslında yalnızca `register` (kaydet) özelliği olan bir nesneler. Bu özellik ise `async function (server, options)` imzası olan bir işlev. Bir de zorunlu olan `name` (isim) özelliği ve `versiyon` gibi bir çok seçime bağlı özelliği var.

Çok basit bir eklenti şöyle görünür:

```javascript
'use strict';

const myPlugin = {
    name: 'myPlugin',
    version: '1.0.0',
    register: async function (server, options) {

        // Örnek bir yol yaratalım

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'hello, world';
            }
        });

        // vesaire...
        await someAsyncMethods();
    }
};
```

Ya da harici bir modül olarak yazıldıklarında `pkg` özelliği belirleyebilirsin:

```javascript
'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options) {

        // Örnek bir yol yaratalım

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'hello, world';
            }
        });

        // vesaire...
        await someAsyncMethods();
    }
};
```

Birinci örnekte `name` (isim) ve `version` (versiyon) özelliklerini açıkça belirtirken ikinci örnekte `pkg` özelliğini içeriği package.json olacak şekilde gönderdiğimize dikkat et. İki şekilde de çalışır.

Bir modül olarak yazıldığında, bir eklenti ya üst seviye bir modül çıktısı örn: `module.exports = { register, name, version }` ya da modülün bir hapi eklentisinden fazlasını çıkartsın istersen `exports.plugin = { register, name, version }` olabilir.

Ayrıca, eklenti nesnesi değeri `true` olan bir `multiple` (çoklu) özelliği içererek hapiye bu eklentinin bir sunucuya birden fazla kez kaydedilmesinin güvenilir olduğunu söyleyebilir.

Kullanılabilir bir diğer özellik ise `once`tır (bir kez). `true` olarak ayarlandığında mükerrer kayıtlar hapi tarafından hata fırlatmaksızın görmezden gelinecektir.


### Kaydetme (register) Yontemi

Yukarıda gördüğümüz üzere, `register` (kaydet) yöntemi iki değiştirge kabul eder: `server` ve `options`.

`options` (seçenekler) değiştirgesi basitçe kullanıcının `server.register(plugin, options)` yöntemini çağırırken eklentine gönderdiği seçeneklerdir. Nesne olduğu gibi yazdığın `register`(kaydet) yöntemine gönderilir.

`register`, eklentinin kaydedilmesi için gerekli adımlar tamamlandıktan sonra async (asenkron) olarak sonuç dönen bir işlev olmalıdır. Alternatif olarak eklentin, eğer kayıt işlemi sırasında bir sorun oluşursa hata fırlatmalıdır.

`server` (sunucu) nesnesi eklentinin kurulduğu sunucuya bir referanstır.

## Bir eklentiyi yüklemek

Eklentiler `server.register()` yöntemiyle tek tek ya da bir grup olarak bir dizinin içinde yüklenebilir. Örneğin:

```javascript
const start = async function () {

    // bir eklenti yükle

    await server.register(require('myplugin'));

    // birden fazla eklenti yükle

    await server.register([require('myplugin'), require('yourplugin')]);
};
```

Eklentine seçenekler göndermek için, bunun yerine `plugin` (eklenti) ve `options` (seçenekler) anahtarlarıyla birer nesne gönderiyoruz. Mesela:

```javascript
const start = async function () {

    await server.register({
        plugin: require('myplugin'),
        options: {
            message: 'hello'
        }
    });
};
```

Bu nesneler bir dizi içinde de gönderilebilir:

```javascript
const start = async function () {

    await server.register([{
        plugin: require('plugin1'),
        options: {}
    }, {
        plugin: require('plugin2'),
        options: {}
    }]);
};
```

### Kayit secenekleri

`server.register()`a isteğe bağlı ikinci bir değiştirge de gönderebilirsin. Bu nesnenin dokümantasyonu [API referansı](/api#-await-serverregisterplugins-options)nda bulunabilir.

Seçenekler nesnesi hapi tarafından klentinin yüklendiği yollara (route) `vhost` ya da `prefix` değiştirgeçlerini göndermen için kullanılır ve yüklenen eklentilerle paylaşılmaz.

Farzı mahal şöyle bir eklentimiz olsun:

```javascript
'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options) {

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'test passed';
            }
        });

        // vesaire...
        await someAsyncMethods();
    }
};
```

Normalde bu eklenti yüklendiğinde `/test`e bir `GET` yolu oluşturur. Ancak seçeneklerdeki `prefix` (ön ek) ayarı kullanılarak bu eklenti içerisinde oluşturulan tüm yollara belirli bir ön ek eklenebilir:

```javascript
const start = async function () {

    await server.register(require('myplugin'), {
        routes: {
            prefix: '/plugins'
        }
    });
};
```

`prefix` (ön ek) seçeneği sebebiyle artık bu eklenti yüklendiğinde `GET` yolu (route) `/plugins/test` olarak oluşacak.

Aynı şekilde `options.routes.vhost` özelliği yüklenen eklentiler tarafından oluşturulan tüm yollara (route) varsayılan bir sanal sunucu `vhost` atar. `vhost` ayarı hakkında daha fazla bilgi [API referansı](/api#-serverrouteroute)nda bulunabilir.
