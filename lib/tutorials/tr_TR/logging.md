## Gunlukleme

_Bu kurs hapi v17 ile uyumludur_

Her sunucu yazılımında olduğu gibi, günlükleme çok önemlidir. hapinin hazır gelen bazı günlükleme ve bu günlükleri görüntüleme yöntemleri bulunur.

### Hazir gelen yontemler

Neredeyse aynı çalışan iki günlükleme yöntemi var: [`server.log(tags, [data, [timestamp]])`](/api#-serverlogtags-data-timestamp), and [`request.log(tags, [data])`](https://hapijs.com/api#-requestlogtags-data). Her ikisi de uygulamandaki bir olayı günlüklemek için kullanılıyor. İstek işleyici, istek yaşam döngüsü uzatması ya da kimlik doğrulama şeması gibi istek kapsamında bulunan yerlerde `request.log()` kullanmak uygunken; geri kalan yerlerde, kapsamında belli bir istek yokken, örneğin, sunucun başlar başlamaz ya da bir eklentinin `register()` yönteminde, `server.log()` kullanmak daha uygundur.

Her ikisi de ilk iki değiştirge olarak `tags` (etiketler) ve `data` (veri) kabul eder.

`tags` olayı açıkça adlandıran bir metin ya da metin dizisi olabilir. Bunları günlükleme seviyeleri (log level) olarak düşünebilirsin ancak bir farkla: bunlar daha açıklayıcılar. Örneğin, veritabanından veri alırken meydana gelen bir hatayı şöyle etiketleyebilirsin:

```javascript
server.log(['error', 'database', 'read']);
```

hapinin oluşturduğu her günlükleme olayında kendiğinden `hapi` etiketi bulunur.

İkinci değiştirge olan `data` (veri) değiştirgesi olayla birlikte günlüklenecek seçime bağlı bir metin ya da nesnedir. Hata mesajı ya da etiketle birlikte günlüklenmesini istediğin bilgileri buraya koyacaksın.

Ek olarak `server.log()` yönteminin üçüncü bir `timestamp` (zaman damgası) değiştirgesi bulunur. Bunun varsayılanı `Date.now()`dır ve yalnızca bir sebeple üstüne yazmak istenirse kullanılmalıdır.

### Hataları okumak ve görüntülemek

hapi sunucu nesnesi her bir günlükleme olayı için bir olay yayınlar. Standart EventEmitter API (olay yayınlayıcı uygulama programa arayüzü)nü kullanarak bu olayları dinleyebilir ve istediğin gibi gösterebilirsin.


```javascript
server.events.on('log', (event, tags) => {

    if (tags.error) {
        console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
    }
});
```


`server.log()` kullanılarak günlüklenen olaylar bir `log` (günlükleme) olayı, `request.log()` kullanılarak günlüklenen olaylar ise bir `request` (istek) olayı yayınlar.

Bir istek ile ilgili tüm günlükleri  `request.logs` kullanarak alabilirsin. Günlüklenen tüm istek olaylarını içeren bir dizi döner. Önce yol (route) üzerinde `log.collect` seçeneğini `true` olarak ayarlamalısın, yoksa dizi boş gelir.

```javascript
server.route({
    method: 'GET',
    path: '/',
    options: {
        log: {
            collect: true
        }
    },
    handler: function (request, h) {

        return 'hello';
    }
});
```

### Hata ayiklama modu (yalnizca gelistirme sirasinda)

hapinin ekstra bir eklenti ya da kendi yazdığın bir günlükleme koduna gerek olmaksızın günlükleme olaylarını konsola döktüğü bir hata ayıklama modu var.

Varsayılan olarak, konsola yalnızca kullanıcı kodu içerisinde yakalanmayan ve hapi API içerisindeki hatalı donatılardan kaynaklanan hatalar ekrana dökülür. Ancak istersen sunucunu etiketlere dayalı olarak istek (request) olaylarını yazdırmak üzere de ayarlayabilirsin. Örneğin, istekler sırasında oluşan tüm hataları yazdırmak için sunucunu şu şekilde ayarlayabilirsin:

```javascript
const server = Hapi.server({ debug: { request: ['error'] } });
```

Hata ayıklama modu hakkında daha fazla bilgili [API dokümantasyonu](https://hapijs.com/api#-serveroptionsdebug)nda bulabilirsin.

## Gunlukleme eklentileri

hapi tarafından hataları okumak ve yazdırmak için sunulan yöntemler gerçekten minimalisttir. Daha çok özellik bulunduran bir günlükleme deneyimi için [good](https://github.com/hapijs/good) ya da [bucker](https://github.com/nlf/bucker) gibi bir paket bakabilirsin.
