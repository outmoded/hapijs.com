## Cookies

_Esse tutorial é compatível com o hapi v11.x.x._

Quando estamos desenvolvendo uma aplicação web, usar cookies é com bastante frequência uma necessidade. Ao utilizar o hapi, cookies são flexíveis, seguros e simples.

## Configurando o servidor

O hapi possui várias opções configuráveis ​​ao lidar com cookies. Os padrões são bons para a maioria dos casos, mas podem ser alterados quando necessário.

Para configurá-los, invoque `server.state(nome, opções)` onde `nome` é o nome em string do cookie e `opções` é um objeto usado para configurar o cookie específico.

```javascript
server.state('data', {
    ttl: null,
    isSecure: true,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: false, // remove cookies inválidos
    strictHeader: true // não permite violações da RFC 6265
});
```

Esta configuração fará com que o cookie chamado `data` tenha o tempo de vida da sessão(será apagado quando o navegador for fechado), e seja sinalizado como seguro e apenas HTTP (veja [RFC 6265](http://tools.ietf.org/html/rfc6265), especificamente as seções [4.1.2.5](http://tools.ietf.org/html/rfc6265#section-4.1.2.5) e [4.1.2.6](http://tools.ietf.org/html/rfc6265#section-4.1.2.6) para mais informações), e informa ao hapi que o valor é um JSON String codificado em base64. A documentação completa para as opções do ` server.state ()` podem ser encontradas em [referência da API](api#serverstatename-options).

Além disso, você pode passar dois parâmetros para o `config` ao adicionar uma rota:

```json5
{
    config: {
        state: {
            parse: true, // analisa e armazena em request.state
            failAction: 'error' // também pode ser 'ignore' ou 'log'
        }
    }
}
```

## Definindo um cookie

A definição de um cookie é feita através da [interface `reply()`](/api#reply-interface) em um manipulador de requisição, pré-requisito, ou ponto de extensão do ciclo de vida da requisição e se parece com o seguinte:

```javascript
reply('Hello').state('data', { firstVisit: false });
```

Neste exemplo, o hapi irá responder com a string `Hello`, bem como definir um cookie chamado` data` a uma string codificada em base64 cuja representação é o objetivo especificado.

## Eliminando um cookie
O cookie pode ser eliminado invocando o método `unstate()` no objecto [`response`](/api#response-object):

```javascript
reply('Hello').unstate('data', { firstVisit: false});
```

### Sobrescrevendo opções

Ao definir um cookie, você também pode passar as mesmas opções disponíveis para `server.state()` como um terceiro parâmetro, tais como:

```javascript
reply('Hello').state('data', 'test', { encoding: 'none' });
```

Ao eliminar um cookie, as opções especificadas têm que ser iguais ás definições que estão no server.
