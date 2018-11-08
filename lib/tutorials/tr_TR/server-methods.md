## Sunucu yöntemleri

_Bu kurs hapi v17 ile uyumludur_

Sunucu yöntemleri birden fazla yerde kullanılan modüllerin lazım olan her talep edilmesindense sunucu nesnene iliştirebildiğin kullanışlı bir yol sunar. Bir sunucu yöntemi kaydetmek için [`server.method()`](https://hapijs.com/api#server.method()) çağrısı yap. Bu yöntemi çağırmanın iki farklı yöntemi var. `server.method(name, method, [options])` imzasıyla çağırabilirsin. Örneğin:

```javascript
const add = function (x, y) {

    return x + y;
};

server.method('add', add, {});
```

`server.method(method)` imzasıyla da çağırabilirsin. Burada `method` (yöntem) `name` (isim), `method` (yöntem) ve `options` (seçenekler) değiştirgelerine sahip bir nesnedir (Ayrıca bu nesnelerden oluşan bir dizi de gönderebilirsin).

```javascript
const add = function (x, y) {

    return x + y;
};

server.method({
    name: 'add',
    method: add,
    options: {}
});
```

### Isim

`name` (isim) değiştirgesi daha sonra sunucudan yöntemi `server.methods[name]` yöntemi ile çağırmak için kullanılacak bir metindır. Eğer `name` (isim) değiştirgesini bir `.` (nokta) karakteri ile gönderirsen; bir metin yerine aşağıda olduğu gibi iç içe bir nesne olarak kaydedilir.

```javascript
server.method('math.add', add);
```

Bu sunucu yöntemi `server.methods.math.add()` ile çağrılır.

### Islev

`method` (yöntem) değiştirgesi yöntem çağrısı yapıldığında gerçekten çağırılacak olan işlevdir. İstediği kadar argüman alabilir. `async` (asenkron) bir fonksiyon olabilir. Örneğin:

```js
const add = async function (x, y) {

    const result = await someLongRunningFunction(x, y);
    return result;
};

server.method('add', add, {});
```

Sunucu yöntem işlevin geçerli bir sonuç dönmeli ya da bir hata oluştu ise fırlatmalıdır.

## Onbellekleme

Sunucu yöntemlerinin başlıca avantajlarından biri hapinin ana önbelleklemesini geliştirebilmeleridir. Varsayılan olarak önbellekleme yapmaz ancak yöntem kaydedilirken geçerli bir yapılandırma verildiğinde dönen sonuç önbelleklenecek ve her çağrıldığında yöntemini tekrar çalıştırmak yerine önbellekten sunulacaktır. Yapılandırma şuna benzer:

```javascript
server.method('add', add, {
    cache: {
        expiresIn: 60000,
        expiresAt: '20:30',
        staleIn: 30000,
        staleTimeout: 10000,
        generateTimeout: 100
    }
});
```

değiştirgelerin anlamları:

* `expiresIn`: öğe son kez önbelleklendiği andan itibaren süresinin dolması için geçmesi gereken milisaniye cinsinden süre. `expiresAt` ile birlikte kullanılamaz.
* `expiresAt`: Yol (route) ile ilgili önbelleklerin süresinin dolması için 24 saatlik gösterimle 'HH:MM' formatında ifade edilen günün saati. Yerel zamanı kullanır. `expiresIn` ile birlikte kullanılamaz.
* `staleIn`: Önbellekteki bir öğenin bayat olarak işaretlenerek yeniden oluşturmaya kalkışmadan önce geçmesi gerek milisaniye cinsinden süre. En az `expiresIn` kadar olmalıdır.
* `staleTimeout`: Bayatlamış bir öğeyi dönmeden önce generateFunc oluşturma fonksiyonunun taze bir değer üretmesi için beklenilecek maksimum süre.
* `generateTimeout`: Bir değeri üretmek uzun sürdüğünde zaman aşımı hatası vermeden önce beklenecek milisaniye cinsinden süre. Değer gerçekten döndüğünde gelecek istekler için önbelleklenir.
* `segment`: Önbellek öğelerini ayrıştırmak (isolate) için kullanılan isteğe bağlı bölme adı
* `cache`: Sunucuda kullanılmak için yapılandırılmış bir önbellek bağlantı adını taşıyan isteğe bağlı bir metin

Önbellekleme hakkında daha fazla bilgi [catbox](https://github.com/hapijs/catbox#policy) dokümantasyonu ve [API referansında](/api#servermethodmethod) bulunabilir.

Bir sunucu yönteminin her bir çağrı sonucunun `ttl` (time-to-live (yaşanacak zaman))inin üzerine `ttl` bayrağını ayarlayarak yazabilirsiniz. Önceki örnekte bu nasıl olurdu bir bakalım:

```js
const add = async function (x, y, flags) {

    const result = await someLongRunningFunction(x, y);

    flags.ttl = 5 * 60 * 1000; // 5 mins

    return result;
};

server.method('add', add, {
    cache: {
        expiresIn: 2000,
        generateTimeout: 100
    }
});

server.methods.add(5, 12);
```

Burada sunucu yöntem işlevimizi normalde göndermeyi planladığımızdan bir fazla değiştirge alacak şekilde tanımlayarak hapi tarafından gönderilecek `flags` (bayraklar) değiştirgesine yer açtık. Daha sonra `ttl` bayrağının üzerine sonucun (milisaniye cinsinden) ne kadar önbelleklenmesini istiyorsak onu yazdık. Eğer yazdığımız değer `0` olsaydı bu değer asla önbelleklenmeyecekti. Eğer bayrak ayarlamasaydık önbellek yapılandırmasındaki `ttl` kullanılacaktı.

### Ozel bir anahtar uretmek

Yukarıdaki seçeneklere ek olarak, yöntemine gönderilen değiştirgeleri kullanarak önbellek anahtarı üretmek için kullanılacak özel bir işlev de tanımlayabilirsin. Eğer yöntemin yalnızca metin, sayı ve mantıksal içeriyorsa hapi senin için akıllı bir anahtar üretecektir. Ancak yönteminin değiştirgesi bir nesneyse önbellek anahtarını üretecek aşağıdaki gibi bir işlem sağlaman gerekir:

```javascript
const sum = function (array) {

    let total = 0;

    array.forEach((item) => {

        total += item;
    });

    return total;
};

server.method('sum', sum, {
    generateKey: (array) => array.join(',')
});
```

Yöntemine gönderdiğin tüm argümanlar `generateKey` yöntemi tarafından kullanılabilir.

### Bagla (bind)

Sunucu yöntemine gönderilen son isteğe bağlı yöntem `bind` (bağla)dır. `bind` seçeneği yöntem içerisinde geçerli olan `this` (bu) kapsamını değiştirir. Varsayılan olarak bu yöntem eklendiği andaki aktif kapsamdır. Bu özellik kullanılarak, ayrıca bir değiştirge olarak gönderilen veritabanı istemcisi sebebiyle bir de `generateKey` (anahtar üret) işlevi tanımlama sorununu ortadan kaldırabilir. Örneğin:

```javascript
const lookup = async function (id) {

    // myDB.getOne çağrısı yapar

    return await this.getOne({ id });
};

server.method('lookup', lookup, { bind: myDB });
```
