## Rotas

Quando definimos uma rota no Hapi, assim como em outros frameworks, são necessários três elementos básicos: o caminho, o método e o manipulador. Estes elementos são passados para o servidor como um objeto, e pode ser tão simples quanto o exemplo seguinte:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello!');
    }
});
```

## Métodos

Está rota responde a um método `GET`  com a `string` 'Hello!'. A opção `method` pode ser qualquer qualquer método http válido, ou uma `array` de métodos. Você dizer que você deseja a mesma resposta quando o usuário envia tanto um pedido `PUT` quanto o `POST`, você poderia fazer isso da seguinte forma:

```javascript
server.route({
    method: ['PUT', 'POST'],
    path: '/',
    handler: function (request, reply) {
        reply('I did something!');
    }
});
```

## Caminho

A opção `path` deve ser uma `string` e também poderá conter parâmetros nomeados. Para indicar o parâmetro na `string` basta involve-lo com `{}`. Por exemplo: 

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user}',
    handler: function (request, reply) {
        reply('Hello ' + encodeURIComponent(request.params.user) + '!');
    }
});
```

Como você pode ver acima, temos o parâmetro `{user}` no nosso caminho, isso significa que estamos atribuindo este segmento do caminho a um parâmetro nomeado. Estes parâmetros são armazenados no objeto `request.params` junto com o manipulador. Desde que nomeamos nosso parâmetro `user` podemos acessar seu valor com a propriedade `request.params.user` depois da codificação da URI de modo a evitar ataques de injeção de conteúdo.

### Parâmetros Opcionais

Neste exemplo, o parâmetro `user` é obrigatório: uma requisição a `/hello/bob` ou `/hello/susan` irá funcionar, porém uma requisição a `/hello` não funcionará. Para criar um parâmetro opcional, basta colocar um ponto de interrogação no final do nome do parâmetro. Veja o mesmo exemplo anterior alterado para o parâmetro `user` ser adicional: 

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user?}',
    handler: function (request, reply) {
        const user = request.params.user ? encodeURIComponent(request.params.user) : 'stranger';
        reply('Hello ' + user + '!');
    }
});
```

Agora uma requisição para `/hello/mary` irá responder com `Hello mary!` e a requisição para `/hello` irá responder com `Hello stranger!`. É importante estar ciente que apenas o *último* parâmetro em um caminho pode ser opcional. Isso significa que `/{one?}/{two}/` é um caminho inválido, isso porque existe outro parâmetro após um opcional. Você também pode ter um parâmetro nomeado parcial em um segmento do caminho, mas você só pode ter um parâmetro por segmento. Isso significa que `/{filename}.jpg` é valido, enquando `/{filename}.{ext}` é inválido.

### Parâmetros de multisegmentos

Junto com o parâmetro de caminho opcional, você também pode permitir que esses parâmetros correspodam com vários segmentos. Para fazer isso, utilizamos um asterisco e um número. Por Exemplo: 

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user*2}',
    handler: function (request, reply) {
        const userParts = request.params.user.split('/');
        reply('Hello ' + encodeURIComponent(userParts[0]) + ' ' + encodeURIComponent(userParts[1]) + '!');
    }
});
```

Com essa configuração, uma requisição para `/hello/john/doe` responderá com a string `Hello john doe!`. É importante notar que o parâmetro possui uma sequencia de caracteres com `/`. E por isso que fizemos um split no parâmetro para obter o usuário em duas partes separadas. O número após o asterisco indica quantos segmentos de caminho deve ser atribuído ao parâmetro. Você também pode omitir o numero, nesse caso o parâmetro irá coincidir com qualquer numero de segmentos. Como os parâmetros opcionais, um parâmetro curinga pode apenas aparecer no último parâmetro em seu caminho.

Ao determinar o manipulador a ser utilizado em um requisição em particular, o hapi pesquisa caminhos do menos específico para o mais específico. Isso significa que caso você tenha duas rotas, uma com o caminho `/filename.jpg` e a outra com o caminho `/filename.{ext}` a requisição para `/filename.jpg` irá coincidir com o primeiro caminho e não o segundo. Da mesma forma que uma rota para `/{files*}` será a ultima rota testada, e só corresponderá se todas as outras rotas falharem.

## Método manipulador

A opção `handler` é uma função que aceita dois parâmetros, `request` e `reply`.   

O parâmetro `request` é um objeto com detalhes sobre a solicitação do usuário final, como parâmetros de caminho, carga associada, informações de autenticação, cabeçalhos, etc... Toda a documentação sobre o que o objeto `request` contem pode ser encontrado na [referência de API](/api#request-properties).

O segundo parâmetro, `reply`, é um método usado para responder as requisições. Como você viu nos exemplos anteriores, se você deseja responder com uma carga útil, você precisa simplesmente passar como um parâmetro para o `reply`. A resposta pode ser uma string, um buffer um objeto serializado em json ou uma stream. O resultado de  `reply` é um objeto de resposta, que pode ser encadeado com métodos adicionais para alterar a resposta antes de serem enviados. Por exemplo `reply('created').code(201)` enviará uma carga de trabalho `created` com um código de status `201`. Você também pode atribuir valores aos `header`, `content-type`, `content-lenght`, enviar uma resposta direta, e muitas outras coisas que são documentadas na [referência de API](/api#response-object).

## Configuração

Além desses três elementos basicos, você também pode especificar um parâmetro `config` para cada rota. É onde você configura coisas como [validação](/tutorials/validation), [autenticação](/tutorials/auth), pré-requisitos, processo de carga, e opções de `cache`. Mais detalhes podem ser encontrados nos tutoriais, assim como na [referência de API](/api#route-options).

Aqui vamos exemplificar um par de opções concebidas para ajudar a gerar a documentação:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user?}',
    handler: function (request, reply) {
        const user = request.params.user ? encodeURIComponent(request.params.user) : 'stranger';
        reply('Hello ' + user + '!');
    },
    config: {
        description: 'Say hello!',
        notes: 'The user parameter defaults to \'stranger\' if unspecified',
        tags: ['api', 'greeting']
    }
});
```

Em aspecto de funcionalidades isso não tem nenhum efeito, entretando eles podem ser muito valiosos ao utilizar plugins como [lout](https://github.com/hapijs/lout) para gerar a documentação de sua API. O `metadate` é associado com esta rota, e logo depois se torna disponível para inspeção ou visualização.  
