## Instalando o hapi

_Este tutorial é compatível com o hapi v11.x.x._

Crie um novo diretório `meuprojeto`, entre nele e:

* Execute: `npm init` e siga as instruções, esse comando irá gerar o arquivo package.json para você.
* Execute: `npm install --save hapi` esse comando instalará o hapi e irá salvá-lo no package.json como uma dependência do seu projeto.

É isso! Agora você tem tudo que precisa para criar um servidor usando hapi.

## Criando um servidor

O servidor mais simples é semelhante ao seguinte:

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
```
Primeiro, precisamos do hapi. Então, criamos um novo objeto do servidor hapi. Em seguida, adicionamos uma conexão ao servidor, passando o número da porta a ser escutada. E então, o servidor é iniciado e o log indicará que ele está sendo executado.

Ao adicionar a conexão ao servidor, podemos informar um hostname, o endereço IP, ou até mesmo um arquivo de socket Unix ou uma pipe nomeada do Windows para vincular ao servidor. Para mais detalhes, veja [a API de referência](/api/#serverconnectionoptions).

## Adicionando rotas

Agora que temos um servidor, vamos acrescentar uma ou duas rotas para que ele realmente faça alguma coisa. Vamos ver como ficaria:

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        return reply('Olá, mundo!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        return reply('Olá, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Servidor rodando em: ${server.info.uri}`);
});
```

Salve o código acima como `server.js` e inicie o servidor com o comando `node server.js`. Agora, se você acessar o endereço http://localhost:3000 no seu navegador, verá o texto `Olá, mundo!`, e se acessar http://localhost:3000/stimpy verá `Olá, stimpy!`.

Perceba que nós codificamos o parâmetro name na URI, isso é para evitar ataques de injeção de conteúdo. Lembre-se, não é uma boa prática exibir os dados para o usuário sem antes codificá-lo!

O parâmetro `method` pode ser qualquer método HTTP válido, uma coleção de métodos, ou ainda um asterisco (*), para permitir qualquer método. Já o `path` define o caminho com a inclusão de parâmetros. Ele pode conter parâmetros opcionais, numerados e até mesmo coringas. Para mais detalhes, veja [o tutorial sobre rotas](/tutorials/routing).

## Criando páginas estáticas e conteúdo

Provamos que podemos iniciar uma simples aplicação Hapi com o nosso Alô Mundo. A seguir, vamos usar um plugin chamado **inert** para servir uma página estática. Antes de começar, pare o servidor com **CTRL + C**.

Para instalar o inert, execute o comando no terminal: `npm install --save inert`. Esse comando baixará o inert e o adicionará ao `package.json`, que é o arquivo que indica quais pacotes estão instalados.

Adicione o código abaixo ao seu arquivo `server.js`:

``` javascript
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            reply.file('./public/hello.html');
        }
    });
});


```

O comando `server.register()` adiciona o plugin inert na sua aplicação Hapi. Se algo de errado acontecer, queremos saber. Então, passamos uma função anônima que, se invocada, receberá `err` e em seguida lançará esse erro. Essa função de retorno é necessária quando registramos os plugins.

O comando `server.route()` registra a rota `/hello`, que informa ao seu servidor para aceitar requisições GET para `/hello` e responder com o conteúdo do arquivo `hello.html`. Colocamos a função de retorno do roteamento dentro do registro do plugin inert, pois precisamos garantir que inert seja registrado _antes_ de usá-lo para processar a página estática. Em geral, é recomandável executar o código que depende do plugin dentro da função de retorno responsável por registrá-lo, assim teremos a garantia da existência do plugin quando nosso código for executado.

Inicie o seu servidor com `npm start` e acesse a url `http://localhost:3000/hello` no seu navegador. Ah não! Recebemos o erro 404, pois nunca criamos o arquivo `hello.html`. Você precisa criar o arquivo para que o erro não volte a acontecer.

Crie um diretório chamado `public` na raiz do seu projeto. Depois, crie um arquivo chamado `hello.html`, dentro desse diretório, com o HTML a seguir: `<h2>Olá mundo.</h2>`.  Em seguida, recarregue a página no seu navegador. Você deverá ler a expressão "Olá mundo.".

Inert exibirá qualquer conteúdo salvo no seu disco rígido quando a requisição for feita, isto é o que leva a carregar em tempo real. Você pode personalizar a página `/hello` ao seu gosto.

Para mais detalhes sobre como o conteúdo estático funciona acesse [Servindo Conteúdo Estático](/tutorials/serving-files). Essa técnica é comumente usada para imagens, folhas de estilos e páginas estáticas em aplicações web.

## Usando plugins

Um desejo comum na criação de qualquer aplicação web é um log de acesso. Para adicionar um log básico na nossa aplicação, vamos carregar o plugin [good](https://github.com/hapijs/good) e o seu relator [good-console](https://github.com/hapijs/good-console) no nosso servidor.

Primeiro precisamos instalar o plugin:

```bash
npm install --save good
npm install --save good-console
npm install --save good-squeeze
```

Depois, atualize o seu `server.js`:

```javascript
'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        return reply('Olá, mundo!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        return reply('Olá, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'Servidor rodando em: ' + server.info.uri);
    });
});
```

Agora, ao iniciar o servidor, você verá:

```
140625/143008.751, [log,info], data: Servidor rodando no: http://localhost:3000
```
E acessando `http://localhost:3000/` no navegador, você verá:

```
140625/143205.774, [response], http://localhost:3000: get / {} 200 (10ms)
```

Ótimo! Este é apenas um pequeno exemplo da capacidade dos plugins, para mais informações confira o [tutorial dos plugins](/tutorials/plugins).

## Outras informações

Hapi tem muitos outros recursos e somente alguns são documentados em tutoriais aqui. Por favor, use a lista da direita para vê-los. Ademais, o restante da documentação pode ser vista na [API de referência](/api) e, como sempre, sinta-se a vontade para fazer perguntas ou visite-nos no freenode em [#hapi](http://webchat.freenode.net/?channels=hapi).
