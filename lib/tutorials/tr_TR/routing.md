## Yol Tayin Etmek (routing)

_Bu kurs hapi v17 ile uyumludur_

Aynı diğer çatılarda (framework) olduğu gibi, hapide de bir yol tanımlarken üç değiştirgeye ihtiyacın var: path (güzergah), method (yöntem) ve handler (işleç). Bunlar sunucuna bir nesne olarak gönderilir ve bu kadar da basittir:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return 'Selam!';
    }
});
```

## Yöntemler (method)

Yukarıdaki yol (route) `/` güzergahına yapılan bir `GET` isteğine `Selam!` metinyla cevap verir. method (yöntem) seçeneği geçerli bir HTTP yöntemi ya da bir yöntem dizisi olabilir. Diyelim ki kullanıcıların `PUT` yöntemiyle de `POST` yöntemiyle de istekte bulunsa aynı cevabı vermek istiyorsun. Öyleyse şöyle yapabilirsin:

```javascript
server.route({
    method: ['PUT', 'POST'],
    path: '/',
    handler: function (request, h) {

        return 'Bir şey yaptım!';
    }
});
```

## Güzergah (path)

Güzergah seçeneği bir metin olmalı. Bununla birlikte içerisinde adlandırılmış değiştirgeler bulundurabilir. Bir güzergahtaki bir değiştirgeyi adlandırmak için onu `{}` içerisine alman yeterli. Örneğin:

```javascript
server.route({
    method: 'GET',
    path: '/selam/{user}',
    handler: function (request, h) {

        return `Selam ${encodeURIComponent(request.params.user)}!`;
    }
});
```

Yukarıda gördüğün üzere, güzergahımızda `{user}` metin bulunuyor. Bu da demek oluyor ki güzergahın bu kısmında adlandırılmış bir değiştirge istiyoruz. Bu değiştirgeler işleyicide `request.params` içerisinde tutulur. `user` değiştirgemizi adlandırdığımız için `request.params.user`dan erişebiliriz. Tabi içerik yerleştirme saldırılarına karşı URI kodlamadan geçirdikten sonra.

### Secime bagli degistirgeler

Yukarıdaki örnekte, user değiştirgesi gereklidir: `/selam/hilmi` ya da `/selam/erdem` çalışır ancak `/Selam` çalışmaz. Bir değiştirgeyi seçime bağlı kılmak için; değiştirge adının sonuna bir soru işareti koyman yeterli olur. Aşağıda aynı yol, bu kez `user` değiştirgesi seçime bağlı olarak gösteriliyor:

```javascript
server.route({
    method: 'GET',
    path: '/selam/{user?}',
    handler: function (request, h) {

        const user = request.params.user ?
            encodeURIComponent(request.params.user) :
            'yabancı';

        return `Selam ${user}!`;
    }
});
```

Bu kez `/selam/keren` adresine yapılan bir istek `Selam keren!` olarak, `/Selam` adresine yapılan bir istekse; `Selam yabancı!` olarak cevaplanacaktır. Yalnız farkında olunması önemli bir husus var: yalnızca yolun sonundaki değiştirge seçime bağlı olabilir. Yani `/{bir?}/{iki}/` şeklindeki bir güzergah geçerli olmayacaktır çünkü bu durumda seçime bağlı olandan sonra bir değiştirge daha var. Bölmenin yalnızca bir kısmını etkileyen adlandırılmış bir değiştirgen olması da `/{dosyaadi}.jpg` uygundur. Hatta aralarında değiştirge olmayan bir ayraç olduğu sürece bir bölme içerisinde birden fazla adlandırılmış değiştirge de kullanabilirsin. Yani `/{dosyaadi}.{uzanti}` geçerliyken `/{dosyaadi}{uzanti}` geçersizdir.

### Cok bolmeli degistirgeler

Seçime bağlı güzergah değiştirgelerinin yanı sıra, birden çok bölmeyle eşleşen değiştirgelerin de olabilir. Bunun için bir yıldız imi ve bir de sayı kullanıyoruz. Örneğin:

```javascript
server.route({
    method: 'GET',
    path: '/selam/{user*2}',
    handler: function (request, h) {

        const userParts = request.params.user.split('/');
        return `Selam ${encodeURIComponent(userParts[0])} ${encodeURIComponent(userParts[1])}!`;
    }
});
```

Bu yapılandırmayla, `/selam/ali/veli` güzergahına yapılan bir istek `Selam ali veli!` metinyla cevaplanır. Burada önemli olan değişgenin `"ali/veli"` metinnın tamamı olmasıdır. Bu yüzden metinna ayrıştırma uygulayarak iki parça elde ettik. Yıldız içinden sonraki sayı değiştirgeye kaç bölme atanacağını belirler. Numarayı hiç yazmaya da bilirsin. Bu durumda değiştirge var olan bütün bölmelerle eşlenir.

Belirli bir istek için hangi işleç kullanılacağına karar vermek için hapi, en kesin olandan en az kesin olana doğru güzergahları arar. Örneğin `/dosyaadi.jpg` ve `/dosyaadi.{uzanti}` şeklinde iki güzergah tanımlarsanız; `/dosyaadi.jpg`ye yapılan bir istek ilk güzergahla eşleşecek, ikincisi ile eşleşmeyecektir. Bu aynı zamanda `/{dosyalar*}` şeklinde tanımlanmış bir güzergahın denenen *son* güzergah olacağı ve yalnızca diğer güzergahların eşleşme denemeleri sonuçsuz kaldığında eşleşeceği anlamına gelir.

## Islec yöntem

İşleç seçeneği iki değiştirge kabul eden bir işlevdir: `request` ve `h`.

`request` değiştirgesi son kullanıcının isteğinin güzergah değiştirgesi, iliştirilen yararlı veri, kimlik doğrulama bilgisi, başlık ve benzeri detaylarını taşıyan bir nesnedir. `request` (istek) nesnesinin içeriğinin ne olduğuna dair tam bir dokümantasyon [API referansı](/api#request-properties)nda bulunabilir.

İkinci değiştirge olan `h` ise isteğe cevap vermekte kullanılan bir çok yöntem barındıran yanıt alet takımıdır. Önceki örneklerde gördüğün üzere, eğer bir isteğe bir değerle cevap vereceksen işleçten onu dönmen yeter. Yararlı yük bir metin, tampon (buffer), JSON'a çevrilebilen bir nesne, akan bir veri (stream) ya da söz (promise) olabilir.

Alternatif olarak aynı değerleri `h.response(value)` içerisine gönderek burdan gelen sonucu işleçten dönebilirsin. Bu çağrının sonucunda gönderilmeden önce üzerinde zincir çağrılar yapılarak içeriği değiştirebilen bir yanıt (response) nesnesi olur. Örneğin `h.response('created').code(201)` çağrısının yararlı verisi HTTP durum kodu `201` olan `created` (oluşturuldu) olur. Eğer istersen başlıkları, içerik tipini (content type), içerik uzunluğunu değiştirebilir; yönlendirme yanıtı verebilir ve [API referansı](/api#response-toolkit)nda dokümante edilen daha bir çok şey yapabilirsin.

## Yapilandirma

Bu üç basit elemanın yanında her bir yola (route) bir de `options` (yapılandırma) değiştirgesi gönderebilirsin. Burada [veri doğrulama (validation)](/tutorials/validation), [kimlik doğrulama (authentication)](/tutorials/auth), ön gereksinimler, yararlı yük işlemleri, ve önbellekleme seçeneklerini ayarlayabilirsin. Bağlantıları verilen öğreticiler ve [API referansı](/api#route-options)nda daha fazla bilgi bulabilirsin.

Burada dokümantasyon üretmek için tasarlanan bir kaç seçeneğe bakıyoruz:

```javascript
server.route({
    method: 'GET',
    path: '/selam/{user?}',
    handler: function (request, h) {

        const user = request.params.user ?
            encodeURIComponent(request.params.user) :
            'stranger';

        return `Selam ${user}!`;
    },
    options: {
        description: 'Say Selam!',
        notes: 'The user parameter defaults to \'stranger\' if unspecified',
        tags: ['api', 'greeting']
    }
});
```

Fonksiyonel olarak bu yapılandırmanın hiç bir etkisi yok ancak eğer [lout](https://github.com/hapijs/lout) gibi bir eklenti ile API dokümantasyonu oluştururken bu bilgiler çok değerli oluyor. Bu yardımcı veriler yol (route) hakkında bilgi veriyor ve daha sonra kontrol ederken ve görüntülerken kullanıma hazır oluyor.
