## Validação

Validação de dados é uma ferramenta muito útil para garantir que a sua aplicação é estável e segura. hapi permite essa funcionalidade utilizando o módulo `joi`.

Por padrão, todos os validadores disponíveis são definidos como `true`, o que significa que nenhuma validação será executada.

Se o parâmetro de validação é definido como `false` isso significa que nenhum valor é permitido para esse parâmetro.

Você pode também passar uma função com a declaração padrão `function (value, options, next)` aonde `value` é dado a ser validado, `options` são as opções de validação definidas no objeto server, e `next` é o método callback (com a declaração padrão `function (err, value)`) a ser chamado ao final da validação.

A última configuração disponível dos parâmetros de validação, é um objeto [Joi](https://github.com/hapijs/joi), que permite a criação de validações com uma sintaxe simples e clara.

## Input

O primeiro tipo de validação que o hapi pode executar é a validação de input. Ela é definida no objeto `config` em uma rota, e é capaz de validar cabeçalhos, parâmetros de rota (path), parâmetros de query, e payloads.

Vamos observar um exemplo:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{name}',
    handler: function (request, reply) {
        return reply('Hello ' + request.params.name + '!');
    },
    config: {
        validate: {
            params: {
                name: Joi.string().min(3).max(10)
            }
        }
    }
});
```

### Parâmetros de Rota (path)

Como você pode ver acima, nós passamos um parâmetro `validate.params` para o objeto `config`, essa é a forma que nós informamos ao hapi que um determinado parâmetro especificado na rota deve ser validado. A sintaxe do Joi é muito simples e clara de ler, o validador que nós passamos garante que o parâmetro é uma string, com um tamanho mínimo de 3 caracteres e um tamanho máximo de 10 caracteres.

Com essa configuração, se nós fizermos uma requisição para `/hello/jennifer` nós vamos obter a resposta esperada `Hello jennifer!`, entretanto se nós fizermos uma requisição para `/hello/a` nós vamos obter uma resposta HTTP `400` com o seguinte formato:

```json
{
    "error": "Bad Request",
    "message": "the length of name must be at least 3 characters long",
    "statusCode": 400,
    "validation": {
        "keys": [
            "name"
        ],
        "source": "params"
    }
}
```

Da memsa forma, se nós fizermos uma requisição para `/hello/thisnameiswaytoolong`, nós vamos obter uma resposta HTTP `400` com o seguinte formato:

```json
{
    "error": "Bad Request",
    "message": "the length of name must be less than or equal to 10 characters long",
    "statusCode": 400,
    "validation": {
        "keys": [
            "name"
        ],
        "source": "params"
    }
}
```

### Parâmetros de Query

Para validar parâmetros de query, nós simplesmente especificamos um parâmetro `validate.query` na configuração de rota, e nós vamos obter efeitos similares. Por padrão hapi não irá validar nenhum parâmetro. Se você especificar um validador para um parâmetro de query qualquer, isso significa que você *deve* especificar validadores para todos os parâmetros de query que você gostaria de aceitar.

Por exemplo, se você tem uma rota que lista todos os recursos e você gostaria que o usuário pudesse limitar a quantidade total do resultado, você poderia utilizar a seguinte configuração:

```javascript
server.route({
    method: 'GET',
    path: '/list',
    handler: function (request, reply) {
        return reply(resources.slice(0, request.query.limit));
    },
    config: {
        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(100).default(10)
            }
        }
    }
});
```

Essa configuração garante que o parâmetro de query `limit` é sempre um inteiro entre 1 e 100, e se não especificado um valor assume o valor padrão 10. Entretanto, se nós fizermos uma requisição para `/list?limit=15&offset=15` nós vamos obter uma resposta HTTP `400` com o seguinte formato:

```json
{
    "error": "Bad Request",
    "message": "the key offset is not allowed",
    "statusCode": 400,
    "validation": {
        "keys": [
            "offset"
        ],
        "source": "query"
    }
}
```

Como você pode ver no objeto de erro, o parâmetro `offset` não é permitido. Isso é porque nós não definimos um validador específico para `offset`, mas definimos um validador para `limit`. Se você validar uma chave, por padrão, você deve validar todas as chaves.

### Cabeçalhos

Você pode validar cabeçalhos das requisições, com o parâmetro `validate.headers`.

### Parâmetros payload

Também válido é o parâmetro `validate.payload`, que irá validar todos os dados enviados à uma rota pelo usuário. Funciona da mesma forma que a validação de parâmetro de query, em que se você validar uma chave, você deve validar todas as chaves.

## Saída

O Hapi também pode validar as respostas antes delas serem devolvidas para o cliente.
Essa validação é definida no objeto de `config` e na propriedade `response` da rota.

Se a resposta não for valida, o cliente irá receber um Erro Interno do Servidor (500) como resposta por padrão (veja `response.failAction` abaixo).

A validação de saída é útil para garantir que a sua API está servindo dados consistentes com a documentação/contrato.
Além disso, plugins como [hapi-swagger](https://github.com/glennjones/hapi-swagger) e [lout](https://github.com/hapijs/lout) podem usar os esquemas de validação da resposta para documentar o formato de sáida de cada rota, garantindo que sua documentação está sempre atualizada.

O Hapi também suporta algumas opções para um ajuste fino na validação de saída. Aqui vão algumas dessas opções:

### respose.failAction

Você pode escolher o que acontece quando sua validação falha, configurando `response.failAction` para uma das opções abaixo:
* `error`: enviar um Erro Interno do Servidor (500) como resposta (padrão).
* `log`: apenas registre a violação e envie a resposta como ela está.

### response.sample
Se performance é uma preocupação, é possível configurar para a validar apenas uma porcentagem das respostas.
Isso pode ser feito usando a propriedade `response.sample` do objeto `config` na rota.

### response.status 

Em alguns casos, uma rota pode servir respostas objetos de resposta diferentes.
Por exemplo. uma rota `POST` pode retornar uma das opções a seguir:
* `201` com o novo recurso criado, se um novo recurso for criado.
* `202` com os antigo e os novos valores se um recurso existente foi atualizado.

O Hapi suporta isso, permitindo você especificar um esquema de validação para cada _status code_.
`response.status` é um objeto onde as chaves são os números de _status codes_, e as propriedades são os esquemas do Joi:
```
{
    response: {
        status: {
            201: dataSchema,
            202: Joi.object({ original: dataSchema, updated:  dataSchema })
        }
    }
}
```

### response.options
As opções passadas para o Joi durante a validação. Veja a documentação da API para mais detalhes.

### Exemplo

Aqui está um exemplo da configuração de uma rota que retorna uma lista de livros:

```javascript
const bookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    isbn: Joi.string().length(10),
    pageCount: Joi.number(),
    datePublished: Joi.date().iso()
});

server.route({
    method: 'GET',
    path: '/books',
    config: {
        handler: function (request, reply) {

            getBooks((err, books) => {

                if (err) {
                    return reply(err);
                }

                return reply(books);
            });
        },
        response: {
            sample: 50,
            schema: Joi.array().items(bookSchema)
        }
    }
});

```

Assim, será validado apenas metade das respostas (`sample: 50`).
Por quê, `response.failAction` não é especificado, o Hapi irá responder com `500` como código de erro, se algum dos livros não for exatamente válido para o esquema.
A resposta de erro *não* indica a razão do erro.
Se os registros (logging) estiverem configurados, você será capaz de inspecionar os registros de erros sobre a causa da falha na validação da resposta.
Se `response.failAction` estiver configurada para `log`, então o Hapi irá responder com os dados originais, e registrar o erro na validação.
