## 路由

_该教程适用于 hapi v17版本_

在 hapi 定义路由与其他框架类似，你需要指定三个基本的元素: method, path 以及 handler。 他们将作为一个对象传入到你的服务器对象中，如下:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return 'Hello!';
    }
});
```

## 方法

上面的代码将对 `/` 路径下的 `GET` 请求作出响应，并返回一个 `Hello!` 字符串。 method 可以接收任何有效的 HTTP 方法或者方法数组。当你希望响应 `PUT` 或`POST` 请求时，可以做如下修改:

```javascript
server.route({
    method: ['PUT', 'POST'],
    path: '/',
    handler: function (request, h) {

        return 'I did something!';
    }
});
```

## 路径

path 参数必须为一个字符串, 虽然他们可以包含一个命名的参数。 如果需要对路径中的参数进行命名，需要使用 `{}` 包围起来，例如:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user}',
    handler: function (request, h) {

        return `Hello ${encodeURIComponent(request.params.user)}!`;
    }
});
```

如上所示，在路径中我们使用了字符串 `{user}`。 着意味着路径中这段位置的内容将赋值于一个命名的参数，这个参数将在这个 handler 内位于 `request.params` 对象中。 我们现在可以通过 `request.params.user` 访问 user 的值, 在 URI 编码后，这也可以防范内容注入攻击。

### 可选参数

在上面的示例中，user 参数是必须要有的: 一个请求如 `/hello/bob` 或 `/hello/susan` 将会正常工作。 但是一个请求如 `/hello` 就不能工作了。可以通过在参数的最后添加一个问号使得参数变为可选的。以下代码为在同样的路由下使用可选参数：

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user?}',
    handler: function (request, h) {

        const user = request.params.user ?
            encodeURIComponent(request.params.user) :
            'stranger';

        return `Hello ${user}!`;
    }
});
```

现在一个请求发往 `/hello/mary` 将会返回 `Hello mary!` 如果只是发给 `/hello` 将会返回 `Hello stranger!`。 这里需要注意的是在路径中只有 *最后* 一个命名的参数可以为可选的。 这意味着 `/{one?}/{two}/` 是不合法的路径, 因为在可选参数后有另一个命名的参数。你可以针对路径内容的一部分进行命名，例如 `/{filename}.jpg` 是合法的。你可以指定多个命名参数，但是请注意需要用非参的分隔符进行分割。 这意味着 `/{filename}.{ext}` 是合法的而 `/{filename}{ext}` 不是。

### 多段参数

除了可选的路径参数，参数也可以匹配多段内容，可以通过 * 或数字来完成。例如:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user*2}',
    handler: function (request, h) {

        const userParts = request.params.user.split('/');
        return `Hello ${encodeURIComponent(userParts[0])} ${encodeURIComponent(userParts[1])}!`;
    }
});
```

通过这个配置, 请求 `/hello/john/doe` 将会返回字符串 `Hello john doe!`。重点要注意的是，这里的参数实际上是字符串 `"john/doe"`. 所以需要通过 `split` 分割来获取里面的内容。 * 后面的数字表示有多少段内容将会被赋予参数。 你也可以完全省略这个数字，该参数将会匹配任意数量的可用段。 正如同可选参数一样, 通配参数 （如 `/{files*}`）  *只会* 只能出现在路径的最后。

对于处理请求时，越是具体的路径参数，hapi将越优先使用。这意味着当你拥有两个路由时，一个路径为 `/filename.jpg` 另一个路径为 `/filename.{ext}`。当一个请求访问 `/filename.jpg` 将会匹配到第一个而不是第二个。 这意味着一个路由的路径参数为 `/{files*}`时，将会是 *最后一个* 使用的路由，而且只会在前面的路由都无法匹配才会这样。

## Handler 方法

Handler 是一个接收两个参数的函数, `request` 和 `h`。

`request` 是用户请求对象的具体信息，例如参数、请求内容数据, 授权信息以及http头部信息等。 关于 `request` 对象所包含的具体信息的文档可以在这里查阅 [API reference](/api#request-properties)。

第二个参数 `h` 是响应处理对象，它包含了一些处理请求的方法。 如同你之前看到的, 如果你需要一些返回值, 你可以直接通过 handler 返回。 返回的内容可以是字符串，buffer，JSON 序列化对象, stream 或者 promise。

另外你也可以将上述的返回值传递给 `h.response(value)` 来返回。 这个方法调用的返回值是一个响应对象, 可以在响应发出前通过链式调用增加额外的方法。例如 `h.response('created').code(201)` 将会返回 `created` 并且 HTTP 状态码为 `201`。 你也可以设置响应头、内容类型、内容长度、重定向请求和文档中记录的其余类型 [API reference](/api#response-toolkit)。

## 配置

除以上基本的三个要素之外, 你也可以为每一个路由指定 `options` 参数。 这如同你在 [数据验证](/tutorials/validation)，[身份认证](/tutorials/auth)章节中的配置一样。包括预处理, 内容处理以及缓存配置。更多细节内容请参阅 [API reference](/api#route-options)。

以下代码是为路由添加文档的示例：

```javascript
server.route({
    method: 'GET',
    path: '/hello/{user?}',
    handler: function (request, h) {

        const user = request.params.user ?
            encodeURIComponent(request.params.user) :
            'stranger';

        return `Hello ${user}!`;
    },
    options: {
        description: 'Say hello!',
        notes: 'The user parameter defaults to \'stranger\' if unspecified',
        tags: ['api', 'greeting']
    }
});
```

从功能上讲，除非你使用了一些插件如 [lout](https://github.com/hapijs/lout) 去生成你的 API 文档，否则这些选项并不会生效。 这些元数据将会被赋予路由，你可以在之后的处理过程中使用它们。
