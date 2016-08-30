## Autenticação

_Este tutorial é compatível com o hapi v10.x.x_

A autenticação no hapi tem como base um conceito de esquemas (`schemes`) e estratégias (`strategies`).

Pense num esquema como um tipo geral de autenticação, como "basic" ou "digest". Por outro lado, uma estratégia é uma instância pré-configurada e nomeada de um esquema.

Para começar, der uma olhada num exemplo de como utilizar [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic):


```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({ port: 3000 });

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secreto'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, { id: user.id, name: user.name });
    });
};

server.register(Basic, (err) => {

    if (err) {
        throw err;
    }

    server.auth.strategy('simple', 'basic', { validateFunc: validate });
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hello, ' + request.auth.credentials.name);
            }
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('server running at: ' + server.info.uri);
    });
});
```

Neste exemplo, primeiro definimos nossa base de dados `users` com um simples objeto javascript. Então definimos uma função de validação, que é uma funcionalidade específica de [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic) que nos permite verificar se as crendenciais fornecidas pelo usuário são válidas.

Em seguida, registramos o plugin que cria um esquema com o nome de `basic`. Isto é feito dentro do plugin via [server.auth.scheme()](/api#serverauthschemename-scheme).

Uma vez que o plugin foi registrado, nos utilizamos [server.auth.strategy()](/api#serverauthstrategyname-scheme-mode-options) para criar uma estratégia com o nome de `simple` que faz referência ao nosso esquema chamado `basic`. Também passamos um objeto de opções que são repassadas para o esquema, essas opções permitem configurar o comportamento deste esquema.

Por último, definimos uma rota que utiliza a estratégia denominada `simple` para a autenticação.


## Esquemas (`Schemes`)

Um esquema (`scheme`) é um método com a assinatura `function (server, options)`. O parâmetros `server` é uma referência ao servidor em que o esquema está sendo adicionado, e o parâmetro `options` é o objeto de configuração fornecido quando a estratégia que utiliza este esquema foi registrada.

Este método precisa retornar um objeto com *pelo menos* a chave `authenticate`. Outros métodos que podem ser utilizados opcionalmente são `payload` e `response`.

### `authenticate`

O método `authenticate` tem a assinatura `function (request, reply)`, e é um único método *obrigatório* em um esquema.

Neste contexto, `request` é o objeto de requisição criado pelo servidor. É o mesmo objeto que se torna disponível para um manipulador de rota (`route handler`) e está documentado na [referência da API](/api#request-object).



`reply` é a interface de resposta padrão do hapi, e aceita `err` e `result` como parâmetros (nesta ordem).

Se `err` não é um valor null, isto indica uma falha da autenticação e o error poderá ser enviado como uma resposta ao usuário final. É aconselhável utilizar [boom](https://github.com/hapijs/boom) para criar este erro e simplificar o fornecimento de um apropriado `status code` e menssagem de erro.

O parâmetro `result` deve ser um objeto. No entanto, se `err` é fornecido, o parâmetro `result` bem como suas chaves serão opcionais.

Mas se você quiser fornecer mais detalhes em caso de uma falha, o objeto `result` pode ser utilizado e deverá ter uma propriedade `credentials` que é um objeto representando o usuário autenticado (ou as credenciais que o usuário tentou utilizar para a autenticação) e deve ser chamado como `reply(error, null, result);`.

Quando a autenticação é bem sucedida, você precisa chamar `reply.continue(result)` onde _result_ é um objeto com uma propriedade `credentials`.

Adicionalmente, você também pode ter uma chave `artifacts`, que pode conter qualquer dado relacionado à autenticação. Os dados em `artifacts` não são parte das credenciais do usuário.

As propriedades `credentials` e `artifacts` podem ser acessados depois (em um manipulador de rota, por exemplo) como parte do objeto `request.auth`.

### `payload`

O método `payload` tem a assinatura `function (request, reply)`.

Novamente a interface `reply`, padrão do hapi, está disponível aqui. Para sinalizar uma falha chame `reply(error, result)` ou simplesmente `reply(error)` (Mais uma vez recomendamos a utilização de [boom](https://github.com/hapijs/boom)) para erros.

Para sinalizar uma autenticação bem sucedida, chame ll `reply.continue()` sem nenhum parâmetro.

### `response`

O método `response` também tem a assinatura `function (request, reply)` e utiliza a interface padrão `reply`.

Este método é usado para "decorar" o objeto de requisição (`request.response`) com cabeçalhos adicionais, antes da resposta ser enviada para o usuário.

Uma vez que toda a decoração está completa, você precisa chamar `reply.continue()`, e a resposta será enviada.

Se ocorrer algum erro, você deve preferencialmente chamar `reply(error)` onde é recomendado que `error` seja um [boom](https://github.com/hapijs/boom).

### Registro de um esquema

Para registrar um esquema, use `server.auth.scheme(name, scheme)`. O parâmetro `name` é uma string usada para identificar este esquema específico. O parâmetro `scheme` é um método como descrito acima.

## Estratégias

Uma vez que seu esquema foi registrado, você precisa utilizá-lo de algum modo. É aqui que entram as estratégias.

Como mencionado acima, uma estratégia é essencialmente uma cópia pré-configurada de um esquema.

Para registrar uma estratégia, precisamos primeiramente ter um esquema registrado. Uma vez que você já tenha registrado um esquema, utilize `server.auth.strategy(name, scheme, [mode], [options])` para registrar sua estratégia.

O parâmetro `name` deve ser uma string que será utilizada posteriormente para identificar esta estratégia específica.  `scheme` também é uma string que é o nome do esquema cuja instância será usada na estratégia.

### Mode

`mode` é o primeiro parâmetro opcional, e poderá ser `true`, `false`, `'required'`, `'optional'`, ou `'try'`.

O valor padrão é `false`, o que significa que a estratégia será registrada mas não aplicada em lugar algum até que você faça isso manualmente.

Se mode é definido como `true` ou `'required'`, que são iguais, a estratégia será automaticamente assinalada para todas as rotas que não contenham uma configuração `auth`. Essa configuração significa que para acessar uma rota o usuário precisa ser autenticado, e a autenticação precisa ser válida, caso contrário o usuário receberá um erro.

Se mode é definido como `'optional'` a estratégia será aplicada mesmo em rotas sem configuração `auth`, mas nesse caso o usuário *não* necessita ser autenticado. Os dados de autenticação são opcionais, mas se forem fornecidos precisam ser válidos.

A última configuração de mode é `'try'` que também é aplicada em todas as rotas sem uma configuração `auth`. A diferença entre `'try'` e `'optional'` é que com o uso de `'try'` autenticações inválidas também são aceitas, e o usuário ainda chegará no manipulador de rota (route handler).

### Options

O último parâmetro (opcional) é `options`, que será repassado diretamente para o esquema nomeado.

### Configurando uma estratégia padrão

Como previamente mencionado, o parâmetro `mode` pode ser usado com `server.auth.strategy()` para definir uma estratégia padrão. Você pode também definir explicitamente uma estatégia padrão com o uso de `server.auth.default()`.

Este método aceita um parâmetro, que pode ser uma string com o nome da estratégia a ser utilizada por padrão, ou um objeto formatado da mesma forma como os manipuladores de rota [auth options](#route-configuration).

Note que qualquer rota adicionada *antes* de `server.auth.default()` ser chamado não terá a estratégia padrão aplicada. Se você precisa que todas as rotas tenham a estratégia padrão aplicada, é preciso chamar `server.auth.default()` antes de adicionar qualquer uma de suas rotas, ou então definir mode quando registrar a estratégia.

## Configuração de rota

A autenticação também pode ser configurada em uma rota, pelo parâmetro `config.auth`. Se definido para `false`, a autenticação é desabilitada para a rota.

Também podemos definir com uma string com o nome da estratégia a ser utilizada, ou um objeto com os parâmetros `mode`, `strategies`, e `payload`.

O parâmetro `mode` pode ser definido para `'required'`, `'optional'`, ou `'try'` e funciona da mesma forma como quando registramos uma estratégia.

Ao especificar uma estratégia, você pode definir a propriedade `strategy` para uma string com o nome da estratégia. Para especificar mais que uma estratégia, o nome do parâmetro precisa ser `strategies` e deve ser um array de strings com o nome das estratégias para tentar. As estratégias serão então tentadas na ordem de sucessão até que uma tenha sucesso, ou que todas falhem.

Finalmente, o parâmetro `payload` pode ser definido como `false` indicando que o payload não será autenticado, `'required'` ou `true` indica que payload *precisa* ser autenticado, ou `'optional'` indica que se o cliente incluir informações para autenticação do payload, essa autenticação precisa ser válida.

O parâmetro `payload` só pode ser utilizado com uma estratégia que dê suporte ao método `payload` no seu esquema.
