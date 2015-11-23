## Métodos de Servidor

Métodos de servidor são uma maneira útil para compartilhar funções. Eles são anexados no seu objeto servidor em vez de exigirem um módulo comum em todos os lugares necessários. Para registrar um método de servidor, você precisa acessar o objeto `server`. Há duas formas diferentes de fazer isso, uma delas é a passagem de parâmetros separados:

```javascript
var add = function (x, y, next) {
    // note que a função 'next' é utilizada para retornar valores
    next(null, x + y);
};

server.method('add', add, {});
```

Ou um objeto com os parâmetros `name`, `method`, and `options` (perceba que você também pode passar uma coleção desses objetos):

```javascript
var add = function (x, y, next) {
    next(null, x + y);
};

server.method({
    name: 'add',
    method: add,
    options: {}
});
```

## Name

O parâmetro `name` é uma string usada para recuperar o método a ser utilizado pelo servidor, através de `server.methods[name]`. Note que se você nomear o parâmetro `name` com um carácter `.`, ele será registrado como um objeto aninhado em vez de uma string literal. Por exemplo:

```javascript
server.method('math.add', add);
```

será acessível como server.methods.math.add

## Função

O parâmetro `method` é na verdade a função que será chamada quando o método é invocado. Ele pode receber qualquer quantidade de argumentos, mas o seu *último* parâmetro deve ser a função de retorno. A função de retorno aceita três parâmetros: `err`, `result`, and `ttl`. Caso ocorra algum erro no seu método, ele será passado como o primeiro argumento. Se não ocorrer erro, o primeiro argumento deve ser indefinido ou nulo e o valor de retorno será passado como o segundo argumento. O argumento `ttl` é usado para informar ao hapi quanto tempo o valor de retorno pode ser armazenado em cache; se ele for especificado como `0`, então o valor nunca será armazenado em cache.

## Caching

Falando de caching, outra grande vantagem dos métodos de servidor é que eles podem incrementar o cache nativo do hapi. O padrão é sem cache, entretanto se uma configuração válida é passada ao registrar um método, o valor de retorno será armazenado em cache e disponibilizado a partir daí em vez de re-executar o seu método todas as vezes que ele for chamado. A configuração é semelhante a seguinte:

```javascript
server.method('add', add, {
    cache: {
        expiresIn: 60000,
        expiresAt: '30:22',
        staleIn: 30000,
        staleTimeout: 10000
    }
});
```

Os parâmetros são:

* `expiresIn`: o tempo em milisegundos para ser mantido em cache, a partir do momento que foi criado
* `expiresAt`: notação em MM:HH, serve para informar o prazo para invalidar o cache. Não pode ser utilizado ao mesmo tempo que expiresIn
* `staleIn`: informa em milisegundos quanto tempo o item deve aguardar para ser marcado como velho no cache, deve ser *menor* que o expiresIn
* `staleTimeout`: milissegundos para aguardar uma resposta antes de informar um valor obsoleto
* `segment`: um nome de segmento opcional usado para isolar itens do cache.
* `cache`: um nome da conexão do cache que foi configurada para uso no servidor, esse parâmetro é opcional

Mais informações sobre as opções de cache podem ser encontradas na [API de Referência](/api#servermethodmethod), bem como na documentação do [catbox](https://github.com/hapijs/catbox#policy).

## Gerando uma chave customizada

Além das opções acima, você também pode passar uma função personalizada. Ela será usada para gerar uma chave com base nos parâmetros passados para seu método. Se o seu método só aceita uma combinação de string, número e valores booleanos, o hapi irá gerar uma chave para você. Porém, se o seu método aceita um objeto como parâmetro, você deve informar uma função que irá gerar a chave similar ao exemplo abaixo:

```javascript
var sum = function (array, next) {
    var total = 0;

    array.forEach(function (item) {
        total += item;
    });

    next(null, total);
};

server.method('sum', sum, {
    generateKey: function (array) {
        return array.join(',');
    }
});
```

Todos os argumentos passados para o seu método são acessíveis através do método generateKey, com *exceção* da função de retorno.

## Bind

A última opção disponvível para métodos de servidor é o `bind`. Essa opção altera o contexto `this` dentro do método. O padrão é o contexto atual ativo quando o método é criado. Isto pode ser útil para a passagem de um cliente de banco de dados sem a necessidade de passá-lo como um parâmetro e exigindo uma função customizada de `generateKey`, como em:

```javascript
var lookup = function (id, next) {
    // chama myDB.getOne
    this.getOne({ id: id }, function (err, value) {
        next(err, value);
    });
};

server.method('lookup', lookup, { bind: myDB });
```