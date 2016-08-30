## Plugins

hapi possui um poderoso e extensível sistema de plugins que permite que você facilmente divida sua aplicação em pedaços isolados contendo lógica de negócios, e utilitários reutilizáveis.

## Criando um plugin

Plugins são muito fáceis de escrever. Em sua essência eles são um objeto contendo uma função `register` com a seguinte declaração `function (server, options, next)`. Essa função `register` possui também um objeto `attributes` em sua estrutura que fornece ao hapi informações adicionais sobre o plugin, como o nome e a versão.

Um plugin básico pode ser definido da seguinte forma:

```javascript
'use strict';

const myPlugin = {
    register: function (server, options, next) {
        next();
    }
};

myPlugin.register.attributes = {
    name: 'myPlugin',
    version: '1.0.0'
};
```

Ou quando escrito como módulo externo:

```javascript
'use strict';

exports.register = function (server, options, next) {
    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
```

Note que no primeiro exemplo, nós definimos a propriedade `name` e `version` especificamente, entretanto no segundo exemplo nós definimos um atributo `pkg` com o conteúdo do package.json e os seus valores. Ambos os métodos são aceitáveis.

Adicionamente, o objeto `attributes` pode conter uma chave `multiple` que quando definida como `true` informa ao hapi que é seguro registrar o plugin mais de uma vez no mesmo servidor.

### O método `register`

Como nós vimos anteriormente, o método `register` aceita três parâmetro, `server`, `options`, e `next`.

O parâmetro `options` é simplesmente qualquer opção que o usuário passa para o seu plugin. Nenhuma mudança é feita e o objeto é passado diretamente para o seu método `register`.

`next` é o método a ser chamado quando o seu plugin já finalizou todas as atividades necessárias para estar registrado. Esse método aceita somente um único parâmetro, `err`, que deve somente ser definido se algum erro aconteceu no processo de registro do seu plugin.

O objeto `server` é uma referência ao `server` que está carregando e registrando o seu plugin.

#### `server.select()`

Servidores podem ter conexões adicionadas com um label definido à elas:

```javascript
const server = new Hapi.Server();
server.connection({ labels: ['api'] });
```

Esse label pode então ser utilizado para aplicar plugins e outras configuração somente para conexões específicas utilizando o método `server.select()`.

Por exemplo, para adicionar uma rota somente para as conexões com o label `'api'`, você utilizaria:

```javascript
const api = server.select('api');

api.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('api index');
    }
});
```

Múltiplos labels podem ser seleciondos ao mesmo tempo passando um array de strings, a seleção é feita com uma lógica OU(OR).
Para definir uma lógica E(AND), você pode realizar chamadas sucessivas ao `server.select()` da seguinte forma:

```javascript
// todos os servidores com a label backend OU api
const myServers = server.select(['backend', 'api']);

// servidores com a label api E admin
const adminServers = server.select('api').select('admin');
```

O método `server.select()` retorna um objeto server contendo somente as conexões selecionadas.

## Carregando um plugin

Plugins podem ser carregados individualmente, ou como parte de um grupo definido em um array, pelo método `server.register()`, por exemplo:

```javascript
// carrega um plugin
server.register(require('myplugin'), (err) => {
    if (err) {
        console.error('Failed to load plugin:', err);
    }
});

// carrega múltiplos plugins
server.register([require('myplugin'), require('yourplugin')], (err) => {
    if (err) {
        console.error('Failed to load a plugin:', err);
    }
});
```

Para passar opções para o seu plugin, cria-se um objeto com as chaves `register` e `options`, por exemplo:

```javascript
server.register({
    register: require('myplugin'),
    options: {
        message: 'hello'
    }
}, (err) => {

    if (err) {
        throw err;
    }
});
```

Esses objetos podem também ser passados como itens de um array

```javascript
server.register([{
    register: require('plugin1'),
    options: {}
}, {
    register: require('plugin2'),
    options: {}
}], (err) => {

    if (err) {
        throw err;
    }
});
```

### Opções dos plugins

Você pode também passar um parâmetro opcional para `server.register()` antes do callback. Documentação para esse objeto pode ser encontrado [API reference](/api#serverregisterplugins-options-callback).

O objeto de opções é utilizado pelo hapi e *não* é passado para o plugin(s) sendo carregado(s). Isso permite que você pré-selecione os servidores baseados em uma ou mais labels, como também aplique modificadores `vhost` ou `prefix` em qualquer rota que o seu plugin registrar.

Por exemplo, vamos dizer que temos um plugin definido da seguinte forma:

```javascript
'use strict';

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/test',
        handler: function (request, reply) {
            reply('test passed');
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
```

Normalmente, quando esse plugin é carregado ele cria uma rota `GET` em `/test`. Isso pode ser alterado utilizando a configuração `prefix` do objeto de opcões, que irá concatenar uma string como prefixo para todas as rotas definidas por esse plugin:

```javascript
server.register({ register: require('myplugin') }, {
    routes: {
        prefix: '/plugins'
    }
}, (err) => {

    if (err) {
        throw err;
    }
});
```

Agora, quando este plugin for carregado, por causa da opção `prexix` a rota `GET` será criada em `/plugins/test`.

De forma análoga o parâmetro `config.vhost` irá designar uma configuração `vhost` padrão para qualquer rota criada pelo plugin sendo carregado. Mais detalhes sobre a configuração `vhost` pode ser encontrado na [API reference](/api#route-options).

O parâmetro `select` funciona exatamente do mesmo jeito que `server.select()` funciona, de forma que você pode passar uma label ou um array de labels para o plugin para o plugins se associar.

```javascript
server.register({ register: require('myplugin') }, {
    select: ['webserver', 'admin']
}, (err) => {

    if (err) {
        throw err;
    }
});
```

Isso permite que você defina plugins para conexões específicas em um server sem precisar alterar o código do plugin.

