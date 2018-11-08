## Métodos nativos

Como todo programa de servidor, o log é muito importante. O Hapi possui alguns métodos nativos de log, bem como uma capacidade limitada para visualização destes logs.

Existem dois métodos bem parecidos de log, `server.log`, e `request.log`. A diferença entre os dois está em qual evento eles emitem, qual objeto emite o evento, e qual dado é automaticamente associado. O método `server.log` emite um evento de `log` no server, e possui a URI do server associada a ele. O `request.log` emite um evento de `request` no `server` e tem o id interno da requisição (`request`) associado a ele.

Os dois aceitam até três parâmetros. Sendo eles `tags`, `data` e `timestamp`, respectivamente.

`tags` é uma string ou um array de strings usado para identificar brevemente o evento. Pense nelas como níveis de log, mas muito mais expressivas. Por exemplo, você pode usar uma tag para um erro ao tentar recuperar dados da sua base de dados da seguinte maneira:

```javascript
server.log(['error', 'database', 'read']);
```

Qualquer evento de log que o hapi gera internamente sempre terá a tag `hapi` associada a ele. É através deste parâmetro que você deve passar coisas como uma mensagem de erro, ou algum outro detalhe que você deseja que vá com a suas tags. O evento de log terá automaticamente a URI do server o qual ele é associado como uma propriedade.


Por último o parâmetro timestamp. O valor padrão (*default*) dele é `Date.now()`, e somente deve ser passado se você precisa sobrescrever o valor padrão por algum motivo.

### Recuperando logs de *request*

O Hapi também possui um método (`request.getLog`) para recuperar eventos de log de um request, assumindo que você ainda tem acesso ao objeto de request. Se chamado sem parâmetros ele ira retornar um array com todos os eventos de log associados ao request. Você também pode passar uma tag ou um array de tags para filtrar o retorno. Isto pode ser útil para recuperar o histórico de todos os eventos de log em um request quando ocorrer um erro para análise.

### Configuração

Por padrão, os únicos erros que o hapi irá apresentar no console são os erros não tratados em códigos externos, e erros de execução devida a uso incorreto da API do hapi. Porém, você pode configurar o server para apresentar os eventos de request baseados em tag. Por exemplo, se você deseja apresentar qualquer erro em uma requisição você deve configurar seu server da seguinte maneira:

```javascript
const server = new Hapi.Server({ debug: { request: ['error'] } });
```

## Plugins de log

Os métodos nativos são mínimos, no entando, para um log mais completo você realmente deveria pensar em usar um plugin como [good](https://github.com/hapijs/good).
