## Views

_Este tutorial é compatível com hapi v16_

hapi tem um extenso suporte para renderização de template, incluindo a habilidade de carregar e alavancar múltiplos motores de templates, partials, helpers (funções usada no templates para manipular dados), e layouts.

## Configurando o servidor

Para inicar com a views, primeiro nós temos que configurar pelo menos um motor de template no servidor. Este é feito pelo método `server.views`:

```javascript
'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');

const server = new Hapi.Server();

server.register(require('vision'), (err) => {

    Hoek.assert(!err, err);

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates'
    });
});

```

Nós estamos fazendo várias coisas aqui.

Primeiro, nós carregamos o modulo [`vision`](https://github.com/hapijs/vision) como um plugin. Isto adiciona um suporte de renderização de template para o hapi. O [`vision`](https://github.com/hapijs/vision) não está incluso no hapi, você precisa instalar ele.

Segundo, no registramos o módulo `handlebars` como o motor responsável pela renderização do templete que contendo a extenção `.html`.

Terceiro, nós dizemos ao servidor que seus templates estam localizacos no diretório `templates` dentro do caminho atual. Por padrão, hapi irá olhar para templates no diretório de trabalho atual. Você pode adicionar um parâmetro com o diretório que os templates estão localizados.

### Opções da View

Temos algumas opções habilitadas para o motor de views no hapi. Toda documentação pode ser encontrada nas [referência da API](/api/#server-options), mas vamos mostrar alguns deles aqui também.

Note que todas opções pode ser definidas de forma global, que configura todos os motores registrados, ou direcionada para um motor específico, por exemplo:

```javascript
server.views({
    engines: {
        'html': {
            module: require('handlebars'),
            compileMode: 'sync' // motor específica
        }
    },
    compileMode: 'async' // configuração global
});
```

#### Motores

Para utilizar views no hapi, você tem que registrar pelo menos um motor de template no servidor. Motor de templates pode ser síncronos, ou assíncronos, e deve ser um objecto quem contém um método com o nome `compile`.

A assinatura do método `compile` para motor síncronos é `function (template, options)` e o método deve retorna uma função com a assinatura `function (context, options)` que deve disparar um erro, ou retornar o html compilado.

Motores de templete assíncronos deve ter um método `compile` com a assinatura `function (template, options, callback)` que chamam `callback` por padrão primeiro formatar o erro e retorna um novo método com a assinatura `function (context, options, callback)`. O método retonado também deve chamar `callback` primeiro formatar erro, e com o html compilado sendo o segundo parâmetro.

Por padrão, hapi assume que o motor de template é síncrono (i.e. `compileMode` o padrão é `sync`), par usar um motor assíncrono você deve definir `compileMode` para `async`.

Aproveitando o parâmetro `options` tanto o método `compile`, e o método que retornado, é através da configuração do `compileOptions` e `runtimeOptions`. As duas opções tem por padrão um objeto vazio `{}`.

`compileOptions` é o objeto passado no segunda parâmetro pelo `compile`, enquando `runtimeOptions` é passado pelo método que `compile` retorna.

Se somente um motor de template é registardo, torna-se automaticamento padrão, permitindo que você deixe de fora a extenção do arquivo ao solicitar a view. Contudo, se mais de um motor for registardo, você deve adiciona a extensão do arquvio, ou definir o `defaultExtension` para o motor que você usa com mais frenquente. Para qualquer views que não usa o motor padrão, você ainda precisa especificar o extenção do arquivo.


Outro opção util é `isCached`. Se definida como `false`, hapi não irá cachear o resultado do template e em vez disso vai ler o template do arquivo tada vez que usar. Quando desenvolver sua aplicação, isto pode ser bastante útil pois evita que você reinicie a sua aplicação toda vez que alterar o templete. É recomentdado que você deixe o `isCached` com o valor padrão `true` em produção.

#### Paths

As views pode ter varios arquivos em difrente locais, hapi permite que você configure varios caminhos para ajudar encontrar os arquvios.
As opções são:

- `path`:  o diretório que contém seus principais templates
- `partialsPath`: o diretório que contém suas partials
- `helpersPath`: o diretório que contém suas templates helpers
- `layoutPath`: o diretório que contém templates layout
- `relativeTo`: usado como prefixo dos outros caminhos, os outros caminho podem ser relativo a este diretório

Adicionalmente, existem duas configurações que alteram como o hapi ira permitir que você use os caminhos. Por padrão, os caminhos absolutos e sair fora do dirtório `path` não é permitido. Este comportamento pode ser mudado configurando o `allowAbsolutePaths` e `allowInsecureAccess` para true.

Por exemplo, se você tiver uma estrutura de diretório tipo:

```
views\
  index.html
  layout\
    layout.html
  helpers\
    getUser.js
    fortune.js
```

Sua configuração pode parecer isso:

```javascript
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './views',
    layoutPath: './views/layout',
    helpersPath: './views/helpers'
});
```

## Rederizando uma visão (view)

Temos duas opções para rederizar uma view, você pode usar o `reply.view()`, ou o monipulador da view.

### `reply.view()`

O primeiro método que renderiza um view que vamos olhar é `reply.view()`. Aqui mostra como é usado este método em um rota:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.view('index');
    }
});
```
Podemos passar o contexto para o `reply.view()`, você passa um objeto no segundo parâmetro, por exemplo:

```javascript
reply.view('index', { title: 'My home page' });
```

### Manipulador de visão (view)

O segundo método para renderizar a view, é usando um objeto com a propriedade view no handler. A rota seria algo como:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: 'index'
    }
});
```

Quando usado o view handler, o contexto é passdo pela chave `context`, por exemplo:

```json5
handler: {
    view: {
        template: 'index',
        context: {
            title: 'My home page'
        }
    }
}
```

### Contexto global

Nós estamos vendo como passar o contexto direto para uma view, mas como é que temos alguns contextos padrão que deve *sempre* estar disponível em todos os templates?

O mais simplete caminho para alcançar isso é usando a opção `context` ao chamar `server.views()`:

```javascript
const defaultContext = {
    title: 'My personal site'
};

server.views({
    engines: {
        'html': {
            module: require('handlebars'),
            compileMode: 'sync' // específico do motor
        }
    },
    context: defaultContext
});
```

O contexto global padrão se fundido com qualquer contexto local, pegando a menor precedência e aplicando para sua view.

### Ajudante de visão (view)

Os modulos de JavaScript definidos no `helpersPath` fica disponivel nos templates.
Por exemplo, nós criamos uma view helper `fortune` que irá escolher e imprimir um elemento de uma array de strings, quando usada em um tempalte.

O código a seguir é uma função helper que irá armazerna em um arquivo chamado `fortune.js` dentro do diretório `helpers`.

```javascript
module.exports = function () {
    const fortunes = [
        'Heisenberg may have slept here...',
        'Wanna buy a duck?',
        'Say no, then negotiate.',
        'Time and tide wait for no man.',
        'To teach is to learn.',
        'Never ask the barber if you need a haircut.',
        'You will forget that you ever knew me.',
        'You will be run over by a beer truck.',
        'Fortune favors the lucky.',
        'Have a nice day!'
    ];
    const x = Math.floor(Math.random() * fortunes.length);
    return fortunes[x];
};
```

Agora nos podemos usar o view helper dentro do nosso template. Aqui está um trecho de código para mostrar a função helper no `templates/index.html` usando handlebars como o motor de renderização:

```html
<h1>Your fortune</h1>
<p>{{fortune}}</p>
```

Agora quando nós iniciamos o servidor e apontar o seu browser para a rota que utiliza seu template (que usa nossa view helper), devemos ver um parágrafo com um frase escolhida randomicamente logo abaixo do cabeçalho.

Para referência, este é um script de servidor complete para usar o método fortune view helper em um template.

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({
    port: Number(process.argv[2] || 8080),
    host: 'localhost'
});

server.register(require('vision'), (err) => {

    Hoek.assert(!err, err);

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates',
        helpersPath: 'helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.view('index');
        }
    });
});

server.start();
```

### Layouts

Hapi inclui suporte embutido para view layouts. Isto vem desabilitado por padrão, porque isto pode entrar em conflito com outros sistemas de layout que alguns motores podem disponibilizar. Nós recomendamos escolher somente um sistema de layout.

Podemos usar o sistema de layout embutido, primeiro configure a view:

```javascript
server.views({
    // ...
    layout: true,
    layoutPath: Path.join(__dirname, 'views/layout')
});
```

Isto permite os layouts embutidos e definidos o layout de páginas padrão para `views/layout/layout.html` (ou qualquer outra extensão que você estiver utilizando).

Estabelecer uma área de conteúdo em seu `layout.html`:

```html
<html>
  <body>
    {{{content}}}
 </body>
</html>
```

E seu view deve ter somente o conteúdo:

```html
<div>Content</div>
```

Quando renderizamos a view, o `{{{content}}}` irá replicar pelo conteúdo da view.

Se você quiser uma layout padrão diferente, você pode definir uma opção globalmente:

```javascript
server.views({
    // ...
    layout: 'another_default'
});
```
Você também pode especificar um layout diferente por view:

```javascript
reply.view('myview', null, { layout: 'another_layout' });
```
