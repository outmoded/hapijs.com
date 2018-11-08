## Views

_Bu kurs hapi v17 ile uyumludur_

hapinin kapsamlı bir şablon işleme desteği bulunur. Buna birden çok şablon motoru yükleyip kullanabilmek (template engine), kısmı şablonlar (partial), yardımcılar (helper function) (şablonlarda kullanılan ve veri işlemek için kullanılan işleçler) ve sayfa düzenleri de dahildir (layout). These capabilities are provided by the [vision](https://github.com/hapijs/vision) plugin.

## Sunucuyu yapılandırmak

Kullanıcı arayüzlerine (view) başlamak için önce en sunucuda en az bir şablon motoru (template engine) yapılandırmalıyız. Bu "vision" tarafından sunulan [`server.views()`](https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions) yöntemi ile yapılıyor.

```javascript
'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');

const server = Hapi.server();

const start = async () => {

    await server.register(require('vision'));

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates'
    });
};

start();
```

Burda bir çok şey yapıyoruz. Önce [vision](https://github.com/hapijs/vision) modülünü bir eklenti olarak yüklüyoruz. O da hapiye şablon işleme desteği katıyor.

İkinci olarak, `handlebars`ı; `.html` uzantılı şablonları işlemekten sorumlu modül olarak kaydediyoruz.

Daha sonra, sunucuya şablonların `templates` (şablonlar) dizininde olduğunu söylüyoruz. `relativeTo` seçeneğini kullanarak bu dizinin şu anda bulunulan dizine bağıl olarak bulunması gerektiğini belirtiyoruz. Varsayılan olarak hapi şablonlar dizinini şu anda çalışılan dizine bağıl olarak arar.

### Kullanıcı arayuzu (view) secenekleri

hapi kullanıcı arayüzü motoru ile ilgili bir çok seçenek bulunur. Tam dokümantasyonu [vision API referansı](https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions)nda bulunuyor ancak biz burada da bir kısmından bahsedeceğiz.

Unutmayın ki tüm seçenekler kayıtlı tüm motorları yapılandıracak şekilde evrensel olarak ayarlanabileceği gibi, belli bir motoru yapılandırmak üzere yerel olarak da ayarlanabilir. Örneğin:

```javascript
server.views({
    engines: {
        html: {
            module: require('handlebars'),
            compileMode: 'sync' // motora özel
        }
    },
    compileMode: 'async' // evrensel ayar
});
```

### Motorlar

hapida kullanıcı arayüzleri kullanmak için sunucuya en az bir şablon motoru kaydetmelisin. Şablon motorlarının çıktı adı (export name) `compile` olmalıdır. Senkron da asenkron da olabilirler.

Senkron bir motorun `compile` yönteminin imzası `function (template, options)` olmalıdır ve bu yöntem de imzası `function (context, options)` olan, derlenen htmli dönen ya da hata fırlatan bir işlev dönmelidir.

Asenkron bir motorun `compile` yöntemi imzası `function (template, options, callback)` olan; standart önce-hata formatında `callback` (geri çağır) çağrısı yapan ve imzası `function (context, options, callback)` olan bir fonksiyon dönen bir yöntem olmalıdır. Dönen yöntem de aynı şekilde önce-hata formatında ikinci değiştirgesi derlenen html olacak şekilde `callback` çağrısı yapmalıdır.

Varsayılan olarak hapi şablon motorlarının senkron olduğu varsayar (`compileMode` varsayılanı `sync`), asenkron bir motor kullanmak için `compileMode`u `async` olarak ayarlamalısın.

`options` değiştirgesinin gücünü `compile` yöntemi ve döndürdüğü yöntemde kullanmak için `compileOptions` ve `runtimeOptions` ayarları kullanılır. Her iki seçeneğin varsayılan değeri boş bir nesnedir `{}`.

`compileOptions`, `compile` yöntemine gönderilen ikinci değiştirgeyken; `runtimeOptions`, `compile` tarafından döndürülen yönteme gönderilir.

Eğer yalnızca bir şablon motoru kayıtlıysa, otomatik olarak varsayılan haline getirilerek kullanıcı arayüzlerini isterken dosya uzantılarıyla uğraşmamanız sağlanmış olur. Ancak birden fazla motor kayıtlıysa ya dosya uzantılarını sona eklemelisin ya da en çok kullandığın motor için `defaultExtension` ayarı yapmalısın. Yine de bu durumda varsayılan motoru kullanmayan kullanıcı arayüzlerini çağırırken dosya uzantısı belirtmek gerekecek.

Bir diğer kullanışlı seçencek `isCached`dir. Eğer `false` olarak ayarlanırsa hapi şablon sonuçlarını önbelleklemez ve bunun yerine her kullanıldığında şablonu dosyasından tekrar tekrar okur. Uygulamanı geliştirirken bu çok işe yarıyor çünkü seni şablonlarla uğraşırken uygulamanı tekrar tekrar yeniden başlatmaktan kurtarıyor. Tabi canlı ortamda `isCached` seçeneğinin `true` olarak ayarlanmasını öneriyoruz.

### Guzergahlar (paths)

Kullanıcı arayüzü dosyaları birden fazla yerde bulunabileceğinden hapi onları bulmak için birden fazla güzergah belirlenmesine izin verir. Bu seçenekler:

- `path`: ana şablonlarının bulunduğu dizin
- `partialsPath`: kısmi şablonlarının bulunduğu dizin
- `helpersPath`: şablon yardımcılarının bulunduğu dizin
- `layoutPath`: sayfa düzeni şablonlarının bulunduğu dizin
- `relativeTo`: diğer dizin tiplerinin başına eklemek için kullanılır. Eğer belirtilirse diğer dizinler bu dizine bağlı dizinler olabilir

Ayrıca, hapinin güzergahların nasıl kullanacağına izin verdiğini ayarlamak için iki ayar bulunur. Varsayılan olarak tam güzergahlara ve `path` (güzergah) dizininin dışına doğru giden güzergahlara izin verilmez. Bu davranışlar `allowAbsolutePaths` (tam güzergahlara izin ver) ve `allowInsecureAccess` (güvensiz erişime izin ver) ayarları `true` olarak ayarlanarak değiştirilebilir.

Örneğin eğer dizin yapın şu şekildeyse:

```
templates\
  index.html
  layout\
    layout.html
  helpers\
    getUser.js
    fortune.js
```

Ayarların şöyle olabilir:

```javascript
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './templates',
    layoutPath: './templates/layout',
    helpersPath: './templates/helpers'
});
```

## Bir kullanici arayuzunu yorumlamak (rendering views)

Bir kullanıcı arayüzünü yorumlarken iki seçeneğin var. Ya `h.view()` yöntemini kullanırsın ki burada `h` [yanıt alet çantası (response toolkit)](/api#response-toolkit)tir ya da kullanıcı arayüzü işleyiciyi.

### [`h.view()`](https://github.com/hapijs/vision/blob/master/API.md#hviewtemplate-context-options)

Bakacağımız ilk kullanıcı arayüzü yorumlayan yöntem `h.view()`. Hemen aşağıda bu yöntemi kullanan bir yol (route)un nasıl görüneceğini görebilirsin:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return h.view('index');
    }
});
```

`h.view()`e bir kapsam göndermek istersen, ikinci değiştirge olarak bir nesne gönderebilirsin. Örneğin:

```javascript
return h.view('index', { title: 'My home page' });
```

### Kullanici arayuzu isleyici (view handler)

Kullanıcı arayüzü işlemenin ikinci yöntemi, hapi'nin hazır gelen kullanıcı arayüzü işleyicisini kullanmaktır. Bu yol (route) şöyle görünür:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: 'index'
    }
});
```

Kullanıcı arayüzünü işlerken, kapsam `context` (kapsam) anahtarıyla gönderilir. Örneğin:

```json5
handler: {
    view: {
        template: 'index',
        context: {
            title: 'My home page'
        }
    }
}
```

### Evrensel kapsam

Bir kapsamı nasıl direkt kullanıcı arayüzüne göndereceğimize baktık ancak; ya tüm şablonlarda *her zaman* elimizin altında olmasını istediğimiz varsayılan bir kapsam varsa?

Bunu yapmanın en kolay yolu `server.views()` yöntemini çağırırken `context` (kapsam) seçeneğini kullanmaktır.

```javascript
const context = {
    title: 'Benim sitem'
};

server.views({
    engines: {
        html: {
            module: require('handlebars'),
            compileMode: 'sync' // motora özgü
        }
    },
    context
});
```

Varsayılan evrensel kapsam gönderilen her yerel kapsamla en düşük önceliği alacak şekilde birleştirilerek kullanıcı arayüzüne uygulanır.

### Kullanici arayuzu yardimcilari

`helpersPath` altında bulunan tüm JavaScript modüllerine şablonlardan erişilebilir. Örnek olarak kullanıcı arayüzünde kullanıldığında bir dizi metinndan birini seçerek yazdıran `fortune` adında bir kullanıcı arayüzü yardımcısı oluşturacağiz.

Aşağıdaki kod bloğu `fortune.js` içerisinde `helpers` dizininde saklayacağımız tam bir yardımcı işlevdir.

```javascript
module.exports = function () {

    const fortune = [
        'Tolga burada uyumuş olabilir...',
        'Ördek lazım mı?',
        'Önce hayır de, sonra pazarlık yap.',
        'Sona kalan dona kalır.',
        'Öğretmek öğrenmektir.',
        'Elinde çekiç olan her şeyi çivi sanır',
        'Beni tanıdığın için kendini affedeceksin',
        'Eller günahkar diller günahkar.',
        'Talih şanslıdan yanadır.',
        'İyi günler!'
    ];

    const x = Math.floor(Math.random() * fortune.length);
    return fortune[x];
};
```

Artık kullanıcı arayüzü yardımcımızı şablonumuzda kullanabiliriz. Aşağıda `templates/index.html` içerisinde handlebars kullanıcı arayüzü yorumlama motorunu ve yardımcı işlevi kullanan bir kod bloğu var.

```html
<h1>Kısmetin</h1>
<p>{{fortune}}</p>
```

Artık sunucumuzu çalıştırdığımızda ve tarayıcımızı şablonu kullanan bir yola (route) yönlendirğimizde (kullanıcı arayüzü yardımcımızı kullanan), başlığın hemen altında rasgele çekilmiş bir kısmet paragrafı görmeliyiz.

Aşağıda referans olarak, şablonunda fortune (kısmet) kullanıcı arayüzü yardımcısını kullanan tam bir sunucu programcığını bulabilirsin.

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({ port: 8080 });

const start = async () => {

    await server.register(require('vision'));

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates',
        helpersPath: 'helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return h.view('index');
        }
    });
};

start();
```

### Sayfa duzenleri (layouts)

Sayfa düzeni sunan bazı diğer kullanıcı arayüzü motorları ile olası çakışmaların önüne geçmek için kapalı olarak gelse de vision; kullanıcı arayüzü sayfa düzenleri için yerleşik destek sunar. Biz yalnızca bir sayfa düzeni sistemi kullanılmasını tavsiye ediyoruz.

Yerleşik olarak gelen sayfa düzeni sistemini kullanmak için önce kullanıcı arayüzü motorunu kur:

```javascript
server.views({
    // ...
    layout: true,
    layoutPath: 'templates/layout'
});
```

Bu, yerleşik sayfa düzenlerini aktifleştiri ve varsayılan sayfa düzeni olarak `templates/layout/layout.html` dosyasını ayarlar. (ya da artık uzantı olarak ne kullanıyorsan).

`layout.html` içerisinde içerik alanını belirle:

```html
<html>
  <body>
    {{{content}}}
 </body>
</html>
```

Ve kullanıcı arayüzüne yalnızca içeriği koy:

```html
<div>Content</div>
```

Kullanıcı arayüzünü yorumlarken, `{{{content}}}` ile kullanıcı arayüzünün içeriği değiştirilecek.

Varsayılan bir sayfa düzeni ayarlamak istersen bunu evrensel olarak yapabilirsin:

```javascript
server.views({
    // ...
    layout: 'another_default'
});
```

Kullanıcı arayüzlerine özel sayfa düzenleri de ayarlayabilirsin:

```javascript
return h.view('myview', null, { layout: 'another_layout' });
```
