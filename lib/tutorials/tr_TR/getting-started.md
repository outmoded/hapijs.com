## Başlarken

_Bu kurs hapi v17 ile uyumludur_

### hapi kurulumu

`projem` adında yeni bir dizin oluştur ve sonra:


* `cd myproject` komutunu çalıştırarak proje dizinine gir.
* `npm init` komutunu çalıştırarak yönergeleri izle, bu komut senin için package.json dosyası oluşturur.
* `npm install --save hapi@17.x.x` komutunu çalıştır. Bu komut hapiyi kurar ve package.json dosyasına gereksinim olarak kaydeder.

Hepsi bu kadar! Artık hapi kullanarak bir sunucu oluşturmak için ihtiyacın olan herşeye sahipsin.

### Bir sunucu olusturmak

En basit sunucu şöyle bir şeydir:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

Önce, hapiyi talep ediyoruz. Sonra dinlenecek konak (host) ve bağlantı noktası (port number) bilgilerini içeren bir yapılandırma nesnesi kullanarak yeni bir hapi sunucu nesnesi oluşturuyoruz. Daha sonra sunucuyu başlatarak çalıştığını günlüklüyoruz.

Bir sunucu oluştururken, konak adı, IP adresi ve hatta bir Unix soket dosyası ya da bağlanılacak Windows adlı veri yolu (Windows named pipe) bile sağlayabiliriz. Daha fazla detay için bkz: [API Referansı](/api/#-server-options).



### Güzergah eklemek

Artık sunucumuz olduğuna göre, bir iki güzergah eklemeliyiz ki gerçekten bir şeyler yapsın. Bakalım nasıl olacak:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        return 'Hello, ' + encodeURIComponent(request.params.name) + '!';
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

Yukarıdakilerin tamamını `server.js` olarak kaydet ve `node server.js` komutunu çalıştırarak sunucuyu çalıştır. Artık tarayıcından [http://localhost:3000](http://localhost:3000) adresini ziyaret ettiğinde `Hello, world!` ve [http://localhost:3000/stimpy](http://localhost:3000/stimpy) adresini ziyaret ettiğinde `Hello, stimpy!` yazdığını göreceksin.

name değiştirgesini URI encode (URI kodladığımıza) ettiğimize dikkat et, bu işlem içerik yerleştirme saldırılarının (content injection attack) önüne geçer. Unutma, kullanıcı tarafından sağlanan verileri çıktılarını kodlamadan önce yorumlamak asla iyi bir fikir değildir!

`method` değiştirgesi herhangi bir geçerli HTTP yöntemi, HTTP yöntem dizisi ya da herhangi bir yönetmi kabul etmek üzere yıldız işareti olabilir. `path` değiştirgesi değiştirgeleri ile birlikte yolu tanımlar. Seçmeli değiştirgeler, numaralanmış değiştirgeler ve hatta özel semboller (wildcard) bile içerebilir. Daha fazla detay için, bkz: [Yol Atama (routing) Eğitimi](/tutorials/routing).

### Duragan sayfalar ve içerikler yaratmak

Hello world uygulamamızla basit bir hapi uygulaması başlatabildiğimizi kanıtladık. Şimdi, **inert** denen bir eklenti kullarak durağan bir sayfa sunacağız. Başlamadan önce, **CTRL + C** tuşlarına basarak sunucuyu durdur.

[inert](https://github.com/hapijs/inert)i kurmak için komut satırında `npm install --save inert` komutunu çalıştır. Bu, [inert](https://github.com/hapijs/inert)i indirerek hangi paketlerin kurulu olduğunu dokümante eden `package.json` dosyana ekleyecek.

`server.js` dosyasını açarak `init` işlevini şu şekilde güncelle:

``` javascript
const init = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/hello',
        handler: (request, h) => {

            return h.file('./public/hello.html');
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
```

Yukarıdaki `server.register()` komutu [inert](https://github.com/hapijs/inert) eklentisini hapi uygulamana ekler.

`server.route()` komutu `/hello` yolunu kaydeder ve sunucuna `/hello` yolundan gelen GET isteklerini kabul ederek `hello.html` dosyası ile cevap vermesini söyler. Yol Atama işlemini `inert` eklentisini kaydettikten sonra yaptık. Bir eklenti kullanarak çalışan bir kodu eklentiyi kaydettikten sonra çalıştırmak genellikle bilgece bir harekettir. Böylece kod çalıştığında eklentinin yüklü olduğu kesinleşmiş olur.

`node server.js` komutunu çalıştırarak sunucu çalıştır ve tarayıcından [`http://localhost:3000/hello`](http://localhost:3000/hello) adresine git. Olamaz! `hello.html` dosyasını oluşturmadığımız için hata alıyoruz. Bu hatadan kurtulmak için hello.html dosyasını oluşturman gerekecek.

Ana dizininde içerisinde `hello.html` olan `public` diye bir dizin oluştur ve içine şu HTMLi göm:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hapi.js is awesome!</title>
  </head>
  <body>
    <h1>Hello World.</h1>
  </body>
</html>
```

Bu basit bir HTML5 dokümanı.

Şimdi tarayıcını yenile. Hello world yazan bir başlık görmelisin.

[Inert](https://github.com/hapijs/inert) istek yapıldığında diskinde ne varsa onu sunar. Bu canlı yenileme olayına sebep olan da bu. `/hello` yolunu zevkine göre düzenle.

Durağan içeriklerin nasıl sunulduğu [Durağan İçerik Sunmak](/tutorials/serving-files) adresinde detaylandırılıyor. Bu teknik genelde resim, biçem sayfaları (stylesheet) ve durağan sayfaları sunmak için kullanırılır.
___

### Eklentileri Kullanmak

Herhangi bir web uygulaması oluştururken genelde erişim günlükleri istenir. Hadi uygulamamıza basit bir günlükleme özelliği eklemek için [hapi pino](https://github.com/pinojs/hapi-pino) eklentisini yükleyelim.

Modülü kurarak başla:

```bash
npm install hapi-pino
```

Sonra `server.js` dosyasını güncelle:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        // request.log(['a', 'name'], "Request name");
        // or
        request.logger.info('In handler %s', request.path);

        return `Hello, ${encodeURIComponent(request.params.name)}!`;
    }
});

const init = async () => {

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: ['response', 'onPostStart']
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

Artık sunucu başladığında şöyle bir şey göreceksin:

```sh
[2017-12-03T17:15:45.114Z] INFO (10412 on box): server started
    created: 1512321345014
    started: 1512321345092
    host: "localhost"
    port: 3000
    protocol: "http"
    id: "box:10412:jar12y2e"
    uri: "http://localhost:3000"
    address: "127.0.0.1"
```

Ve eğer [http://localhost:3000/](http://localhost:3000/) adresini ziyaret edersek, istek ile ilgili günlüklerin terminale yazıldığını görebiliriz.

Günlükleyicinin davranışları kayıt fonksiyonuna gönderilen `options` altında düzenlenir.

Güzel! Bu yalnızca eklentilerin neler yapabildiğini gösteren kısa bir örnekti. Daha fazla bilgi için [plugins tutorial](/tutorials/plugins) adresine göz at.

### Geriye kalan her sey

Hapide burada dokümante edilenlerden hariç daha neler neler var. Lütfen sağında kalan listeyi kullanarak bir göz at.
Geriye kalan her şey [API Referansı](/api)nda dokümante ediliyor ve her zamanki gibi [github](https://github.com/hapijs/discuss/issues) ve [gitter](https://gitter.im/hapijs/hapi)i kullanarak ya da bizi [slack](https://join.slack.com/t/hapihour/shared_invite/enQtNTA5MDUzOTAzOTU4LTUyZmFiYjkyMTBmNDcyMmI2MmRjMzg4Y2YzNTlmNzUzNjViN2U1NmYyY2NjYjhiYWU4MGE2OTFhZDRlYWMyZDY)te ziyaret ederek istediğin soruyu sorabilirsin.
