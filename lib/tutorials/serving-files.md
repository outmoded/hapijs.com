## Servindo arquivos estáticos

_Este tutorial é compátivel com a versão v10.x.x do hapi_

Inevitavelmente quando desenvolvemos algumas aplicações web, surge a necessidade de servir simples arquivos do disco. Há um plugin chamado [inert](https://github.com/hapijs/inert) que adiciona essa funcionalidade para o hapi atráves de manipuladores adicionais.

Primeiro você precisa instalar e adicinar o inert como uma dependência para seu projeto:

`npm install --save inert`

## reply.file()

Primeiro, para usar o método reply:

```javascript
server.register(require('inert'), function (err) {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, reply) {
            reply.file('/path/to/picture.jpg');
        }
    });

    server.start(function (err) {

        if (err) {
            throw err;
        }

        console.log('Server running at:', server.info.uri);
    });
});
```

Como eu tenho certeza que você adivinhou, em sua forma mais simples vocês passa um caminho para `reply.file()` e está feito.

### Caminhos relativos

Para simplificar as coisas, especialemten se você tiver várias rotas que respondem com arquivos, você pode configurar um caminho base no seu servidor e passar apenas os caminhos relativos para `reply.file()`

```javascript
var Path = require('path');
var Hapi = require('hapi');

var server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.register(require('inert'), function (err) {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, reply) {
            reply.file('path/to/picture.jpg');
        }
    });

    server.start(function (err) {

        if (err) {
            throw err;
        }

        console.log('Server running at:', server.info.uri);
    });
});
```

Como você pode ter adivinhado pela opção passada para o servidor, o parâmetro `relativeTo` também pode ser definido em um nível por conexão ou por rota.

## Manipulador de arquivo

Uma alternativa para a rota acima seria o uso do manipulador `file`:

```javascript
server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: {
        file: 'picture.jpg'
    }
});
```

### Opções do manipulador de arquivo

Nós também podemos especificar o parâmetro como uma função que aceita o objeto `request` e retorna uma string que representa o caminho do arquivo (absoluto ou relativo):

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

It can also be an object with a `path` property. When using the object form of the handler, we can do a few additional things, like setting the `Content-Disposition` header and allowing compressed files like so:

```javascript
server.route({
    method: 'GET',
    path: '/script.js',
    handler: {
        file: {
            path: 'script.js',
            filename: 'client.js', // override the filename in the Content-Disposition header
            mode: 'attachment', // specify the Content-Disposition is an attachment
            lookupCompressed: true // allow looking for script.js.gz if the request allows it
        }
    }
});
```

## Directory handler

In addition to the `file` handler, inert also adds a `directory` handler that allows you to specify one route to serve multiple files. In order to use it, you must specify a path with a parameter. The name of the parameter does not matter, however. You can use the asterisk extension on the parameter to restrict file depth as well. The most basic usage of the directory handler looks like:

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

### Directory handler options

The above route will respond to any request by looking for a matching filename in the `public` directory. Note that a request to `/` in this configuration will reply with an HTTP `403` because by default the handler will not allow file listing. You can change that by setting the `listing` property to `true` like so:

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

Now a request to `/` will reply with HTML showing the contents of the directory. We can take this static server one step further by also setting the `index` option to `true`, which means that a request to `/` will first attempt to load `/index.html`. The `index` option also accepts a string or array of strings to specify the default file(s) to load. By setting the `index` option to `['index.html', 'default.html']`, a request to `/` will first try to load `/index.html`, then `/default.html`. This gives us a very simple basic static web server in one route.

When using the directory handler with listing enabled, by default hidden files will not be shown in the listing. That can be changed by setting the `showHidden` option to `true`. Like the file handler, the directory handler also has a `lookupCompressed` option to serve precompressed files when possible. You can also set a `defaultExtension` that will be appended to requests if the original path is not found. This means that a request for `/bacon` will also try the file `/bacon.html`.
