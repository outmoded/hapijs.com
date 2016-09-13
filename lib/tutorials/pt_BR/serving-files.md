## Servindo arquivos estáticos

_Este tutorial é compátivel com a versão v11.x.x do hapi_

Inevitavelmente quando desenvolvemos algumas aplicações web, surge a necessidade de servir simples arquivos do disco. Há um plugin chamado [inert](https://github.com/hapijs/inert) que adiciona essa funcionalidade para o hapi atráves de manipuladores adicionais.

Primeiro você precisa instalar e adicinar o inert como uma dependência para seu projeto:

`npm install --save inert`

## reply.file()

Primeiro, para usar o método reply:

```javascript
server.register(require('inert'), (err) => {

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

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('Servidor rodando em:', server.info.uri);
    });
});
```

Como eu tenho certeza que você adivinhou, em sua forma mais simples você passa um caminho para `reply.file()` e está feito.

### Caminhos relativos

Para simplificar as coisas, especialmente se você tiver várias rotas que respondem com arquivos, você pode configurar um caminho base no seu servidor e passar apenas os caminhos relativos para `reply.file()`

```javascript
'use strict';

const Path = require('path');
const Hapi = require('hapi');

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: Path.join(__dirname, 'public')
            }
        }
    }
});

server.register(require('inert'), (err) => {

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

    server.start((err) => {

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

Isso também pode ser um objeto com a propriedade `path`. Ao usar o objeto formulário do manipulador,
nós podemos fazer algumas coisas adicionais, como o ajuste do cabeçalho `Content-Disposition` e permitir arquivos compactados, como:

```javascript
server.route({
    method: 'GET',
    path: '/script.js',
    handler: {
        file: {
            path: 'script.js',
            filename: 'client.js', // sobreescreve o nome do arquivo no cabeçalho Content-Disposition
            mode: 'attachment', // especifica o Content-Disposition com um anexo
            lookupCompressed: true // permite olhar para script.js.gz se a requisição permitir isso
        }
    }
});
```

## Diretório de manipuladores

Além do manipulador `file`, inert também adiciona um manipulador de `directory` que permite que você especifique um caminho para servir multiplos arquivos. Para usá-lo, você deve especificar um caminho como um parâmetro. O nome do paramâmetro não importa, no entanto. Você pode usar a extensão asterísco para restringir a profundidade do arquivo também. O uso mais básico do manipulador de diretório se parece com:

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

### Opções do manipulador de diretório

A rota acima responderá qualquer requisição procurando por um arquivo correspondente no diretório `public`. Note que a requisição para `/` nessa configuração, responderá com um HTTP `403` por que, por padrão, o manipulador não permitirá uma lista de arquivos. Você pode alterar isso definindo a propriedade `listing` para `true`, assim:

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

Agora a requisição para `\` responderá com um HTML exbindo com o conteúdo do diretório. Nós podemos aproveitar esse servidor estático e ir um passo adiante definindo a opção `index` para `true`, o que siginifica que uma requisição para `/` vai tentar carregar primeiro `index.html`. A opção `index` também aceita uma string ou um array de strings para especificar o arquivo(s) padrão. Por definição, a opção `index` para `['index.html', 'default.html']`, uma requisição para `/` primeiramente tenta carregar `/index.html` e então `default.html`. Isso nos dá, em uma rota, um servidor web estático muito básico e simples.

Quando usamos um manipulador de diretório com a listagem habilitada, por padrão, arquivos ocultos não serão exibidos na lista. Isso pode ser alterado definindo a opção `showHidden` para `true`. Como o manipulador de arquivo, o manipulador de diretório também tem uma opção `lookupCompressed` para servir arquivos pré compactados, quando possível. Você também pode definir um `defaultExtension` que será anexado as requisições se o caminho do arquivo original não for encontrado. Isso significa que a requisição para `/bacon` também tentará o arquivo `/bacon.html`.
