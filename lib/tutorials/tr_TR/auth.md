## Kimlik Dogrulama

_Bu kurs hapi v17 ile uyumludur_

hapide kimlik doğrulama şema (`schema`) ve stratejilerin (`strategy`) üzerine kuruludur.

Şemayı genel bir kimlik doğrulama tipi olarak düşün. "basic" ya da "digest" gibi. Bir strateji ise, önceden ayarlanmış ve adlandırılmış bir şemadır.

Önce, [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic)i kullandığımız bir örneğe bakalım:

```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = async (request, username, password) => {

    const user = users[username];
    if (!user) {
        return { credentials: null, isValid: false };
    }

    const isValid = await Bcrypt.compare(password, user.password);
    const credentials = { id: user.id, name: user.name };

    return { isValid, credentials };
};

const start = async () => {

    const server = Hapi.server({ port: 4000 });

    await server.register(require('hapi-auth-basic'));

    server.auth.strategy('simple', 'basic', { validate });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: 'simple'
        },
        handler: function (request, h) {

            return 'welcome';
        }
    });

    await server.start();

    console.log('server running at: ' + server.info.uri);
};

start();
```

Önce, bu örnekte basit bir nesne olan kullanıcı veritabanımızı (`users`) tanımlıyoruz. Daha sonra [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic)e özel olan ve kullanıcının doğru kimlik bilgilerini verdiğini doğrulayan bir doğrulama işlevi tanımlıyoruz.

Daha sonra, `basic` adında bir şema yaratan eklentiyi kaydediyoruz. Bu, eklenti içerisinde [server.auth.scheme()](/api#serverauthschemename-scheme) ile gerçekleştiriliyor.

Eklentimizi kaydettikten sonra, [server.auth.strategy()](/api#serverauthstrategyname-scheme-mode-options) kullanarak `basic` şemamıza işaret eden `simple` adında bir strateji oluşturuyoruz. Aynı zamanda davranışını düzenlememize yarayan seçenekler içeren bir nesne de gönderiyoruz.

Son olarak bir yola (route) kimlik doğrulama için `simple` adlı stratejiyi kullanmasını söylüyoruz.

## Şemalar

Bir şema (`scheme`) `function (server, options)` imzası taşıyan bir yöntemdir. Sunucu (`server`) değiştirgesi şemanın eklendiği sunucunun referansıyken, seçenekler (`options`) değiştirgesi bu şemayı kullanan stratejiyi kaydederken kullanılan yapılandırma nesnesidir.

Bu yöntem içerisinde *en az* `authenticate` anahtarı olan bir nesne dönmelidir. Kullanılabilecek diğer isteğe bağlı yöntemler `payload` ve `response`tur.

### `authenticate`

`authenticate` yönteminin imzası `function (request, h)`dir ve bir şemada *gerekli* olan tek yöntemdir.

Bu kapsamda, istek (`request`) sunucu tarafından oluşturulan `request` nesnesidir. Yol işleyici içerisinde erişilebilir olan nesne ile aynı nesnedir ve [API Referansı](/api#request-object)nda dokümantasyonu bulunabilir.

`h` standart hapi [yanıt alet takımı (response toolkit)](https://hapijs.com/api#response-toolkit)dır.

Kimlik doğrulama başarılı olduğunda `h.authenticated({ credentials, artifacts })` yöntemini çağırmalı ve dönmelisin. Kimlik bilgileri (`credentials`) özelliği doğrulanan kullanıcının bilgilerini (ya da doğrulama için kullandığı kimlik bilgilerini) içeren bir nesnedir. Ayrıca kullanıcı bilgileri haricinde üretilen kimlik doğrulama ile ilgili bilgileri içeren bir üretiler (`artifacts`) anahtarın da olabilir.

Kimlik bilgileri (`credentials`) ve üretiler (`artifacts`) özellikleri daha sonra (örneğin yol işleyicisinde) `request.auth` nesnesinden erişilebilir.

Eğer giriş başarısızsa, bir hata fırlatabilir ya da `h.unauthenticated(error, [data])` yöntemini çağırıp dönebilirsin. Burada hata (`error`) bir kimlik doğrulama hatası (authentication error) ve veri (`data`) kullanıcı bilgilerini (`credentials`) ve üretileri ('artifacts`) içeren isteğe bağlı bir nesnedir.

Eğer hiç bir veri (`data`) sağlanmayacaksa hata fırlatmakla `return h.unauthenticated(error)` yöntemine çağrıda bulunmanın bir farkı olmaz. Hatanın detayları davranışı etkiler. [`server.auth.scheme(name, scheme)`](https://hapijs.com/api#-serverauthschemename-scheme) hakkında daha fazla bilgi API dokümantasyonunda bulunabilir. Hatalar için [boom](https://github.com/hapijs/boom) kullanılması önerilir.

### Yuk (`payload`)

`payload` yöntemi `function (request, h)` imzasına sahiptir.

Burada da yine standart hapi yanıt alet takımı kullanılıyor. Hatalar için yine [boom](https://github.com/hapijs/boom) kullanmak tavsiye edilir.

Başarılı bir kimlik doğrulama sinyali için `h.continue` dön.

### Yanit (`response`)

`response` yöntemi de `function (request, h)` imzasına sahip ve standart yanıt alet takımını kullanıyor.

Bu yöntem yanıt nesnesini kullanıcıya göndermeden önce ek başlıklarla dekore etmek için oluşturuldu.

Dekorasyon işlemi bittikten sonra, `h.continue` dönmelisin. Böylece yanıt gönderilir.

Eğer bir hata meydana gelirse, bunun yerine [boom](https://github.com/hapijs/boom) olmasını tavsiye ettiğimiz bir hata fırlatmalısın.

### Kayit Etmek

Bir şema (`scheme`) kaydetmek için, `server.auth.scheme(name, scheme)` yöntemini kullan. isim (`name` ) değiştirgesi bu özel şemayı tanımlamak için kullanılan bir metin, şema (`scheme`) değiştirgesi yukarıda açıklanan bir yöntem olmalı.

## Stratejiler

Şemanı kaydettikten sonra, bunu kullanmak için bir yola ihtiyacın var. İşte tam da burada stratejiler devreye giriyor.

Yukarıda söylendiği gibi, bir strateji; önceden yapılandırılmış bir şema kopyasıdır.

Bir strateji kaydetmek için, önce bir şema kaydetmiş olmalıyız. Bunu yaptıktan sonra, stratejiyi kaydetmek için `server.auth.strategy(name, scheme, [options])` kullanabiliriz.

`name` daha sonra bu özel stratejiyi tanımlamak için kullanılacak bir metin olmalı. Yine bir metin olan `scheme` değiştirgesi ise bu stratejinin örneği olacağı şemanın adı olmalı.

### Secenekler

Son değiştirge ise adlandırılan şemaya direk olarak gönderilecek şeçenekler (`options`).

### Varsayilan stratejiyi ayarlamak

`server.auth.default()` kullanarak varsayılan stratejiyi ayarlayabilirsin.

Bu metod bir değiştirge kabul eder. Bu değiştirge ya varsayılan stratejinin adını taşıyan metin, ya da yol işleyicinin kullandığı gibi bir [kimlik doğrulama seçenekleri (auth options)](#yol-route-ayarları) nesnesi olmalıdır.

Burada `server.auth.default()` **çağırılmadan önce** eklenen yollara (route) varsayılan stratejinin uygulanmayacağına dikkat et. Eğer tüm yollara (routelara) stratejinin (strategy) uygulandığından emin olmak istersen ya `server.auth.default()`u daha hiç yol (route) eklemeden önce çağırmalı ya da stratejiyi kaydederken varsayılan modu ayarlamalısın.

## Yol (Route) Ayarlari

Kimlik doğrulama (authentication) aynı zamanda `options.auth` değiştirgesi vasıtasıyla yol (route) üzerine ayarlanabilir. Eğer `false` olarak ayarlanırsa bu yolda (route) kimlik doğrulama kapatılır.

Kullanılacak stratejinin adını taşıyan bir metin ile ayarlanabileceği gibi, `mode`, `strategies` ve `payload` değiştirgeleri ile de ayarlanabilir.

`mode` değiştirgesi `'required'` (zorunlu), `'optional'` (seçime bağlı) ya da `'try'` (dene) olarak ayarlanabilir ve aynı bir stratejiyi (strategy) kaydederkenki gibi çalışır.

Eğer `'required'` (gerekli) olarak ayarlanırsa, kullanıcıların yola (route) erişebilmek için kimliklerini doğrulamış olmaları ve doğrulamalarının geçerli olması gerekir. Yoksa bir hata ile karşılaşırlar.

Eğer `mode` `'optional'` (seçime bağlı) olarak ayarlanırsa, strateji (strategy) yola (route) yine uygulanır ancak bu kez kullanıcının kimliğini doğrulamış olmasına *gerek yok*tur. Kimlik doğrulama verisi seçime bağlıdır ve eğer bulunuyorsa geçerli olmalıdır.

Son `mode` ayarı ise `'try'`dır (dene). `'try'` (dene) ile `'optional'` (seçime bağlı) arasındaki fark, `'try'` (dene) kullanıldığında geçersiz kimlik doğrulamasının kabul edilmesi ve kullanıcının yol işleyiciye yine de ulaşabilmesidir.

Bir strateji (strategy) belirlerken, `strategy` değiştirgesini stratejinin adı olarak ayarlayabilirsin. Birden fazla strateji (strategy) tanımlarken, değiştirgenin adı `strategies` olmalı ve değeri denenecek her bir stratejinin adını taşıyan karakter katarlarından oluşan bir dizi olmalıdır. Her bir strateji biri biri başarılı olana ya da hepsi hata verene kadar denenir.

Son olarak, `payload` (yararlı yük) değiştirgesi `false` olarak ayarlanarak kimlik doğrulama yapılmamış olmasını kontrol etmeye ayarlanabilir. `'required'` ya da `true` ise kimlik doğrulamasının *zorunlu olduğu* olduğu, ya da `'optional'`, eğer kullanıcı bu bilgileri sağlıyorsa geçerli olması gerektiği anlamında kullanılabilir.

`payload` değiştirgesi yalnızca `payload` yöntemini destekleyen şemalarda kullanılabilir.
