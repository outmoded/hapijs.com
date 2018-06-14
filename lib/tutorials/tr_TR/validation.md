## Doğrulama

_Bu kurs hapi v17 ile uyumludur_

Verileri doğrulamak, uygulamanın istikrarlı ve güvenli olmasına yardımcı olur. hapi bu fonksiyonelliği doğrulamalarını basit ve anlaşılır bir nesne söz dizimi kullanarak yapabileceğin [Joi](https://github.com/hapijs/joi) modülünü kullanarak sağlar.

## Girdi (input)

hapinin icra ettiği doğrulamanın ilk çeşidi girdi doğrulamasıdır. Bu, bir yola (route) gönderilen `options` (seçenekler) nesnesinde tanımlanır ve başlıkları, güzergah değiştirgelerini, sorgu değiştirgelerini ve yararlı yük verisini doğrulamakta kullanılır.

Haydi bir örneğe bakalım:

```javascript
server.route({
    method: 'GET',
    path: '/selam/{name}',
    handler: function (request, h) {

        return `Selam ${request.params.name}!`;
    },
    options: {
        validate: {
            params: {
                name: Joi.string().min(3).max(10)
            }
        }
    }
});
```

### Guzergah degistirgeleri

Burada görüldüğü üzere `options` (seçenekler) nesnesine `validate.params` (değiştirgeleri doğrula) seçeneği gönderdik. Hapiye istenilen güzergahta bulunan adlandırılmış değiştirgelerin doğrulanması gerektiğini böyle söylüyoruz. Joi'nin döz dizimi çok basit ve okuması da kolay. Burada gönderdiğimiz doğrulama değiştirgenin en az 3 en fazla 10 karakterden oluşan bir metin olduğunu kontrol ediyor.

Eğer bu yapılandırma ile `/selam/aylin` adresine bir istekte bulunursak beklediğimiz üzere `Selam aylin!` yanıtını alırız. Ancak isteği `/selam/a`ya yaparsak aşağıdaki gibi bir HTTP `400` yanıtı alırız.

```json
{
    "error": "Bad Request",
    "message": "Invalid request params input",
    "statusCode": 400
}
```

Benzeri şekilde, eğer isteği `/selam/adimokadaruzunkianlatamam` adresine yapmış olsaydık da aynı hatayı alacaktık.

### Sorgu degistirgeleri

Sorgu değiştirgelerini doğrulamak için `validate.query` (sorguyu doğrula) seçeneğini gönderiyoruz ve benzeri sonuçlar elde ediyoruz. Varsayılan olarak hapi hiç bir şeyi doğrulamaz. Eğer değiştirgelerden biri için bile doğrulayıcı belirlersen bu demektir ki kabul etmek istediğin mümkün olan tüm sorgu değiştirgileri için doğrulayıcı sağlamak *zorundasın*.

Örneğin, eğer kullanıcı blog yazılarının listesini dönen bir güzergahın varsa ve kullanıcıların sonuç kümesine sayı sınırı uygulamasını istiyorsan aşağıdaki yapılandırmayı kullanabilirsin:

```javascript
server.route({
    method: 'GET',
    path: '/posts',
    handler: function (request, h) {

        return posts.slice(0, request.query.limit);
    },
    options: {
        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(100).default(10)
            }
        }
    }
});
```

Bu `limit` sorgu değiştirgesinin değerinin her zaman 1 ila 100 arasında bir tamsayı olmasını güvence altına alır, ve eğer sağlanmazsa varsayılan olarak 10 kullanır. Ancak eğer `/posts?limit=15&offset=15` adresine istekte bulunursak bir başka `400` yanıtı ve hatası alırız.

Hata aldık çünkü `offset` değiştirgesine izin verilmiyor. Bunun da sebebi `limit` değiştirgesi için bir doğrulama yaparken diğeri için hiç bir şey tanımlamamış olmamız.

### Basliklar

Gelen başlıkları da aynı şekilde doğrulayabilirsin. `validate.headers` (başlıkları doğrula) kullan.

### Yararli yuk (payload) degistirgeleri

`validate.payload` (yararlı yükü doğrula) seçeneği de geçerlidir ve kullanıcı tarafından yola gönderilen yararlı yükü doğrular. Aynı sorgu değiştirgelerinde çalıştığı gibi çalışır ve evet: bir anahtarı doğruluyorsan hepsini doğrulamalısın.

## Çıktı

hapi istemciye göndermeden önce yanıtı da doğrulayabilir.
Bu doğrulama seçenekler nesnesinin `response` (yanıt) özelliğinde tanımlanır.

Eğer bir yanıt, yanıt doğrulamasını geçemezse istemci varsayılan olarak 500, iç sunucu hatası (Internal Server Error) alır (aşağıda bulunan `response.failAction` kısmına bakın).

Çıktı doğrulama, APIının dokümantasyon ya da kontratında belirtilen maddelere uygun şekilde veri sunduğunundan emin olmak için çok elverişlidir.

Buna ek olarak, [hapi-swagger](https://github.com/glennjones/hapi-swagger) ve [lout](https://github.com/hapijs/lout) çıktı doğrulama şemasını otomatik olarak çıktı noktalarını dokümante etmek için kullandığından, dokümantasyonunun her zaman güncel olduğundan emin olmanı da sağlar.

hapi çıktı doğrulamasına ince ayar yapmak için bir çok seçenek sunar. İşte bir kaçı:


___

### response.failAction

`response.failAction`ı aşağıdakilerden birine ayarlayarak yanıt doğrulama başarısız olduğunda ne olacağına karar verebilirsin:
* `error`: bir İç Sunucu Hatası (500) gönder (varsayılan)
* `log`: Sıkıntıyı günlükle ve yanıtı olduğu gibi gönder
* `ignore`: görmezden gel ve isteği işlemeye devam et
* İmzası `async function(request, h, err)` olan bir yaşam göngüsü yöntemi. İmzada bulunan değiştirgelerden `request` istek nesnesi, `h` yanıt alet takımı ve `err` doğrulama hatası olarak gelir

### response.sample

Eğer performans kaygın varsa, hapi yanıtların yalnızca bir kısmını doğrulamak için ayarlanabilir. Bunun için yol (route) yapılandırmasında bununan `response.sample` özelliği kullanılmalıdır. Doğrulanması gereken yanıtların yüzde ne kadarının doğrulanacağını temsil eden `0` ile `100` arasında bir değer verilmelidir.

### response.status

Bazen bir uç noktada (endpoint) birden fazla yanıt nesnesi sunulur.
Örneğin bir `POST` yolu (route) aşağıdakilerden birini dönebilir:
* `201` durum kodu ile birlikte yeni yaratılan kaynak
* `202` durum kodu ile birlikte güncellenen kaynağın eski ve yeni değerleri

hapi bunun üstesinden her yanıt durum kodu (response status code) için farklı bir doğrulama şeması vermeni sağlayarak gelir.
`response.status` anahtarları sayısal durum kodları olan bir nesnedir ve özellikleri joi şemalarıdır.

```json5
{
    response: {
        status: {
            201: dataSchema,
            202: Joi.object({ original: dataSchema, updated:  dataSchema })
        }
    }
}
```

### response.options
joiye doğrulama sırasında gönderilecek seçenekler. Detaylı bilgi için [API dokümantasyonu](/api#-routeoptionsresponseoptions)na bak.

### Örnek

Burada örnek olarak kitap listesi dönen bir yol (route) yapılandırması var:

```javascript
const bookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    isbn: Joi.string().length(10),
    pageCount: Joi.number(),
    datePublished: Joi.date().iso()
});

server.route({
    method: 'GET',
    path: '/books',
    handler: async function (request, h) {

        return await getBooks();
    },
    options: {
        response: {
            sample: 50,
            schema: Joi.array().items(bookSchema)
        }
    }
});

```

Yanıtların yarısını (`sample: 50`) doğrulayacak.
`response.failAction` vermediğimizden, eğer kitaplardan biri `bookSchema`ya (kitap şeması) uymazsa hapi `500` hata kodu verir.
Hata yanıtı hatanın sebebini *göstermez*.
Eğer günlükleme yapılandırdıysan, yanıt doğrulamanın hata vermesine neyin sebep oılduğunu inceleyebilirsin.
Eğer `response.failAction` `log` olarak ayarlansaydı, hapi orjinal yanıtla cevap verirken doğrulama hatasını da günlükleyebilirdi.

### Joi Alternatifleri

Doğrulama için Joi kullanmanızı tavsiye ediyoruz ancak hapinin sunduğu her doğrulama seçeneği aynı zamanda bir kaç farklı seçenek de kabul eder.

En basitinden her seçenek bir mantıksal operatörle ayarlanabilir. Varsayılan olarak var olan tüm doğrulayıcılar `true` olarak ayarlanmıştır ki bu durumda hiç bir doğrulama yapılmaz.

Doğrulama değiştirgeleri `false` olarak ayarlanırsa bu ayarlanan değiştirgelerin hiç bir değer almasına izin verilmediği anlamına gelir.

Bu değiştirgeler aynı zamanda `value`su (değeri) doğrulanacak veri ve `options`ı (seçenekleri) sunucu nesnesinde belirlenen doğrulama seçenekleri olan `async function (value, options)` imzasına sahip özel bir işlev de olabilir. Eğer bu işlev bir değer dönerse, doğrulanan orjinal nesneyi değiştirir. Örneğin, `request.headers`ı doğruluyorsan dönen değer `request.headers`ı ve `request.orig.headers`i değiştirir. Değer dönmezsen hiç birine dokunulmaz. Eğer bir hata fırlatılırsa hata `failAction`da belirtildiği üzere işlenir.
