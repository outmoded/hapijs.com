## Durağan dosya sunumu

_Bu kurs hapi v17 ile uyumludur_

Bir ağ uygulaması yazarken eninde sonunda diskten bir dosya sunmanın vakti geliyor. Ilave işleyicileriyle hapiye bu işlevselliği ekleyen [inert](https://github.com/hapijs/inert) adlı bir eklenti var.

Önce inerti projene gereksinim olarak ekleyerek kurmalısın:

`npm install --save inert`

## `h.file(path, [options])`

Önce, [`h.file()`](https://github.com/hapijs/inert#hfilepath-options) yönteminin nasıl kullanıldığına bakalım:

```javascript
const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('/path/to/picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

Yukarıda göreceğin gibi, en basit haliyle `h.file(path)` dönüyorsun.

### Bagil Guzergahlar (relative path)

Özellikle dosyalarla yanıt veren birden fazla güzergahın olduğunda işleri kolaylaştırmak için sunucuna bir ana güzergah (base path) tanımlayarak `h.file()` yöntemine bağıl güzergahlar yazabilirsin.

```javascript
'use strict';

const Hapi = require('hapi');
const Path = require('path');

const server = Hapi.server({
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
});

const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

`server.options.routes` seçeneğini yukarıdaki gibi ayarladığında _tüm_ yollara (route) uygulanır. `relativeTo` da dahil olmak üzere bu seçenekleri her bir yol (route) için de ayarlayabilsin.

## Dosya isleyici

`file` (dosya) işleyici kullanmak yukarıdaki yola (route) bir alternatif olabilir:

```javascript
server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: {
        file: 'picture.jpg'
    }
});
```

### Dosya iseyici secenekleri

Değiştirgeyi `request` (istek) nesnesi kabul ederek dosyanın güzergahını (tam ya da bağıl olarak) temsil eden bir metin dönen bir fonksiyon olarak da belirtebiliriz:

```javascript
server.route({
    method: 'GET',
    path: '/{filename}',
    handler: {
        file: function (request) {
            return request.params.filename;
        }
    }
});
```

`path` (güzergah) özelliği olan bir nesne de olabilir. İşleyicinin nesne şeklini kullanırken, bir kaç ilave şey de yapabiliriz. Mesela aşağıdaki gibi `Content-Disposition` başlığını ayarlayıp sıkıştırılmış dosyalara izin verebiliriz:

```javascript
server.route({
    method: 'GET',
    path: '/script.js',
    handler: {
        file: {
            path: 'script.js',
            filename: 'client.js', // Content-Disposition başlığındaki dosya adının üstüne yaz
            mode: 'attachment', // Content-Dispositionın bir eklenti olduğunu belirt
            lookupCompressed: true // eğer istek izin veriyorsa script.js.gz aramasını etkinleştir
        }
    }
});
```

## Dizin işleyici

inert, `file` (dosya) işleyicisine ek olarak birden fazla dosya sunacak şekilde yollar (route) belirleyebileceğin bir de `directory` (dizin) işleyicisi özelliği ekler. Bunu kullanmak için yol (route) güzergahını (path) bir değiştirge ile tanımlamalısın. Değiştirgenin adı farketmez. Değiştirgede yıldız imi kullanrak dosya derinliğini de kısıtlayabilirsin. Dizin işleyicisinin en basit kullanımı şöyle:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});
```

### Dizin isleyici secenekleri

Yukarıdaki yol (route) her isteği `public` dizininde istenen dosya adı eşleşmesini arayarak cevaplar. Bu yapılandırma ile `/` yoluna (route) yapılacak bir istek HTTP `403` yanıtı ile karşılanacaktır. Bunu düzeltmek için bir indeks (index) dosyası ekleyebiliriz. Varsayılan olarak hapi dizinde adı `index.html` olan bir dosya var mı diye bakar. İndeks dosyası sunumunu index seçeneğini `false` olarak ayarlayarak kapatabileceğimiz gibi bu seçeneğe indeks olarak gösterilmek üzere bakılacak dosyaların bir dizisini de yazabiliriz.

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            index: ['index.html', 'default.html']
        }
    }
});
```

`/` güzergahına yapılacak bir istek önce `/index.html`i sonra `/default.html`i yüklemeye çalışarak karşılanır. İndeks dosyası olmayınca inert dizinin içeriğini bir liste sayfası olarak görüntüleyebilir. Bu özelliği `listing` özelliğini `true` olarak ayarlayarak etkinleştirebilirsin:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: true
        }
    }
});
```
Şimdi `/` güzergahına yapılan bir istek dizin içeriğini gösteren HTML ile yanıtlanacak. Dizin işleyiciyi listeleme açık olarak kullanırken varsayılan olarak gizli dosyalar listede gösterilmez. Bu `showHidden` seçeneğini `true` olarak ayarlanarak değiştirilebilir. Dosya işleyicide olduğu gibi, dizin işleyicinin de mümkün olduğunda önceden sıkıştırılmış dosyaları sunmak için `lookupCompressed` (sıkıştırılmışına bak) adlı bir seçeneği bulunur. Orjinal güzergah bulunamadığında isteklere eklenmek üzere `defaultExtension` (varsayılan uzantı)  da ayarlayabilirsin. Bu demek oluyor ki `/havuc` için yapılan bir istekte aynı zamanda `/index.html` de denenecek.
