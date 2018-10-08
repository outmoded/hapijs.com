## 数据验证

_该教程适用于 hapi v17版本_

对于你的应用来说，数据验证可以保证应用的稳定和安全。 hapi 通过模块 [Joi](https://github.com/hapijs/joi) 帮助你实现更为简洁清晰的验证代码。

## 输入

第一种验证类型是输入验证，它可以通过路由的 `options` 进行定义。 它可以验证 HTTP 头信息、路径参数、查询参数以及请求的内容。

示例代码如下：

```javascript
server.route({
    method: 'GET',
    path: '/hello/{name}',
    handler: function (request, h) {

        return `Hello ${request.params.name}!`;
    },
    options: {
        validate: {
            params: {
                name: Joi.string().min(3).max(10)
            }
        }
    }
});
```

### 路径参数

正如同上例，我们在 `option` 对象中添加 `validate.params` 来完成这个操作，这就是 hapi 路径参数验证的配置。 Joi 的语法非常简介并且易读, 以上代码将会验证参数字符串的长度，其最小长度为3，最大长度为10。

通过以上配置，如果发送请求 `/hello/jennifer` 将会得到期望的 `Hello jennifer!` 返回。 而请求 `/hello/a` 将会得到如下 HTTP `400` 响应错误:

```json
{
    "error": "Bad Request",
    "message": "Invalid request params input",
    "statusCode": 400
}
```

同样，如果我们发送请求 `/hello/thisnameiswaytoolong` 也会得到相同的错误。

### 查询参数

验证查询参数我们只需要在路由选项中配置 `validate.query`。默认情况下 hapi 不做任何验证，但是如果一但为一个查询参数添加验证时，这将意味着你 *必须* 为你所接受的所有查询参数添加验证。

例如，一个路由返回 blog 列表，并且你希望限制用户的请求条目的数量，你可以通过以下配置来完成:

```javascript
server.route({
    method: 'GET',
    path: '/posts',
    handler: function (request, h) {

        return posts.slice(0, request.query.limit);
    },
    options: {
        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(100).default(10)
            }
        }
    }
});
```

这里 `limit` 查询参数将被限定在 1 与 100之间，如果没有指定这个参数的时候将会有一个为 10 的默认值。当我们发送请求 `/posts?limit=15&offset=15` 将会获得一个 HTTP `400` 响应错误。

之所以得到这个错误是因为 `offset` 参数没有设置验证，因为我们只提供了 `limit` 参数的验证。

### Headers

你可以通过 `validate.headers` 选项验证 HTTP 头部信息。

### Payload 参数

可以通过 `validate.payload` 选项验证 payload参数。 如同查询参数一样，你必须验证所有的内容。

## 输出

hapi 可以在返回之前验证响应信息，这个定义在路由 `options` 对象中的 `response`属性内。

如果一个响应没有通过验证，客户端将会收到一个默认的 (500) 内部服务错误 (参见 `response.failAction` 如下)。

输出验证对于服务是否满足文档规定的数据格式很有帮助。除此之外如同 [hapi-swagger](https://github.com/glennjones/hapi-swagger) 和 [lout](https://github.com/hapijs/lout) 之类的插件会根据验证规则自动生成文档，这可以确保我们的文档总是最新的。

hapi 支持多种选项来调整输出验证，这里简单列举一下：

### response.failAction

你可以通过以下 `response.failAction` 的设置来修改验证失败的行为：
* `error`: 发送内部服务器错误 (500) 请求 (默认)
* `log`: 只记录错误的日志并按原样返回
* `ignore`: 继续处理请求而不做任何事情
* 或者一个带有签名 `async function(request, h, err)` 的方法，其中 `request` 是请求对象, `h` 是 response toolkit ，`err` 是验证错误。

### response.sample

如果你担心性能问题，hapi 可以通过百分比配置只验证一部分请求。这个配置在路由 `config` 对象的 `response.sample`对象中。你可以指定一个`0`到`100`之间的数字以用来指定验证请求的百分比。

### response.status

有时候同样的endpoint会有不同的响应类型，比如一个`POST`路由可能会返回以下内容：
* `201` 代表一个新的资源被创建。
* `202` 代表一个资源被更新。

hapi 可以通过不同的验证模式对此进行支持。`response.status` 是一个以返回码作为Key的对象, 它的属性是 joi 模式:

```json5
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
选项可以在验证的时候传递给 joi。 更多细节请参阅 [API docs](/api#-routeoptionsresponseoptions)。

### 示例

这里是一个返回图书列表的路由配置：

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
    handler: async function (request, h) {

        return await getBooks();
    },
    options: {
        response: {
            sample: 50,
            schema: Joi.array().items(bookSchema)
        }
    }
});

```

这里只验证一半的请求 (`sample: 50`)。如果 `books` 不精确匹配 `bookSchema`时，之所以 hapi 返回 `500` 错误码，是因为 `response.failAction` 没有被定义。与此同时，错误请求 *不* 再能鉴别错误的原因。但是如果你配置了日志, 你依然可以通过查阅日志来发现验证错误的具体原因。如果 `response.failAction` 设置为 `log`, hapi 将会返回原始的内容信息，并将验证错误记录在日之内。

### 除Joi之外的选择

我们建议你使用 Joi 做验证, 但是 hapi 也为每个错误验证提供了一些不同的选项。

最简单的你可以使用一个 boolean 验证器。默认情况下所有可用的验证都设置为 `true` 它表示不会做任何验证。

如果验证的参数设置为 `false` 它表示该参数不允许任何值。

你也可以传递一个自定义拥有`async function (value, options)`签名的函数， `value` 代表要被验证的数据 `options` 是服务器对象内定义的验证的选项。当一个值返回时，这个值将会替换被验证的原始对象。 例如，你正在验证 `request.headers`，返回后的值将会代替 `request.headers`，原始的值将会被保留在 `request.orig.headers`。如果没有返回 headers 将保持不变。 如果发生了错误, 可以通过 `failAction` 进行错误处理。
