## Kurabiyeler

_Bu kurs hapi v17 ile uyumludur_

Bir web uygulaması yazarken, kurabiyeler sıklıkla kullanıcının istekleri arasındaki durumunu tutmak için kullanılır. Hapi ile kurabiyeler esnek, güvenli ve kullanımı kolaydır.

## Sunucuyu ayarlamak

hapi kurabiyeler ile ilgilenirken düzenlenebilir bir çok özellik sunar. Varsayılanları çoğu zaman yeterli olur ancak lazım olursa özellikleri düzenlebilir.

Bir kurabiye kullanmak için önce [`server.state(name, [options])`](/api#-serverstatename-options) ifadesini `name` kurabiye adı ve `options` ayarları içeren bir nesne olacak şekilde çağırarak ayarlamak gerekir.

```javascript
server.state('data', {
    ttl: null,
    isSecure: true,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: false, // bozuk kurabiyeleri at
    strictHeader: true // RFC 6265 ihlallerine göz yumma
});
```

Bu ayarlar bir oturumluk ömrü olan (tarayıcı kapandığında silinmek üzere) `data` adında güvenli ve Httpye Özel (bu bayrakların ne demek olduğunu hakkında daha fazla bilgi için bkz: [RFC 6265](http://tools.ietf.org/html/rfc6265), specifically bölümleri [4.1.2.5](http://tools.ietf.org/html/rfc6265#section-4.1.2.5) ve [4.1.2.6](http://tools.ietf.org/html/rfc6265#section-4.1.2.6)) bir kurabiye oluşturarak hapiye değerin base64 ile kodlanan bir JSON metin (string) olduğunu söyler. `server.state()` ifadesi ve seçeneklerinin tam bir dokümantasyonu [API Referansı](/api#serverstatename-options) altında bulunabilir.

Buna ek olarak, `options.state` nesnesinde bulunan iki özelliği kullanarak kurabiye davranışlarını yol (route) seviyesinde düzenleyebilirsin:

```json5
{
    options: {
        state: {
            parse: true,        // kurabiyeleri ayristir ve request.state icerisinde tut
            failAction: 'error' // 'ignore' ya da 'log' da olabilir
        }
    }
}
```

## Kurabiyeleri Ayarlamak

Kurabiyeler [yanıt alet takımı (response toolkit)](/api#response-toolkit) kullanılarak istek işleyici (request handler), ön gereksinim (pre-requesite) ya da istek yaşam döngüsü uzatma noktaları (request lifecycle extension point) kullanarak ayarlanır ve şöyle görünür:

```javascript
h.state('data', { firstVisit: false });
return h.response('Hello');
```

Hapi, bu örnekte `Hello` metin (string) ile cevap verecek ve aynı zamanda `data` adlı bir kurabiyeyi değeri `{ firstVisit: false }` metinnın base64 ile kodlanmış bir metin temsili olacak şekilde ayarlayacak.

`state()` yöntemi aynı zamanda rahatça zincir çağrılar yapılabilecek şekilde [yanıt nesnesi](/api#response-object)nde de bulunmaktadır. Dolayısıyla yukarıdaki örnek şöyle de yazılabilir:

```javascript
return h.response('Hello').state('data', { firstVisit: false });
```

### Seceneklerin uzerine yazmak


Bir kurabiye ayarlarkan, `server.state()` yöntemine bazı seçenekler de gönderebilirsin. Mesela:

```javascript
return h.response('Hello').state('data', 'test', { encoding: 'none' });
```

Bu örnekte kurabiye hiç bir kodlama olmaksızın `"test"` metinna ayarlanıyor.

## Bir kurabiyenin degerini almak

Yol işleyici (route handler), ön gereksinim (pre-requesite) ya da istek yaşam döngüsü uzatma noktalarında (request lifecycle extension point) `request.state` ile bir kurabiyenin değerine ulaşabilirsin.

`request.state` nesnesi işlenmiş HTTP durumunu içerir. Her bir anahtar kurabiye adını temsil eder ver değeri kurabiyenin değeridir.

```javascript
const value = request.state.data;
// console.log(value) sana { firstVisit : false } sonucunu verir
```

Bu örnek kod, yukarı bulunan ve değeri `{ firstVisit: false }` olan `data` kurabiye anahtarını kullanıyor.

## Kurabiyeleri temizlemek

Kurabiyeler [yanıt nesnesi (response object)](/api#response-object) ya da [yanıt alet takımı (response toolkit)](/api#response-toolkit)nda bulunan `unstate()` yöntemi kullanılarak temizlenebilir:

```javascript
return h.response('Bye').unstate('data');
```
