## 身份认证

_该教程适用于 hapi v17版本_

hapi 的身份认证基于两个概念：`schemes` 和 `strategies`。

可以将 scheme 视为一般类型的认证, 例如 "basic" 或 "digest"。而 strategy 是一个预先配置好并且命名好的 scheme 实例。

首先我们来看一下如何使用 [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic):

```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // '密码: secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = async (request, username, password) => {

    const user = users[username];
    if (!user) {
        return { credentials: null, isValid: false };
    }

    const isValid = await Bcrypt.compare(password, user.password);
    const credentials = { id: user.id, name: user.name };

    return { isValid, credentials };
};

const start = async () => {

    const server = Hapi.server({ port: 4000 });

    await server.register(require('hapi-auth-basic'));

    server.auth.strategy('simple', 'basic', { validate });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: 'simple'
        },
        handler: function (request, h) {

            return 'welcome';
        }
    });

    await server.start();

    console.log('server running at: ' + server.info.uri);
};

start();
```

首先定义我们的 `users` 数据库, 在这个示例中只是一个简单的对象。之后我们定一个验证函数, 这个函数是 [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic) 的一个特性，可以允许我们验证用户是否提供了有效的凭证，
之后我们注册这个插件。随后我们创建一个名为 `basic`的 scheme ，这个可以通过[server.auth.scheme()](/api#serverauthschemename-scheme)来完成。

当这个插件被注册后, 我们可以使用 [server.auth.strategy()](/api#serverauthstrategyname-scheme-mode-options) 去创建一个名为 `simple` 的 strategy。 这个代表的就是我们名为 `basic` 的 scheme。 同时也传递了一个选项对象，这样我们可以配置 scheme 的行为。

最后我们告诉路由使用名为 `simple` 的 strategy 来做身份验证。

## Schemes

`scheme` 是一个拥有签名 `function (server, options)` 的方法。 `server` 参数是需要添加这个 scheme 的服务器对象的引用，`options` 参数是使用它注册 strategy 时的配置。

这个方法返回的对象 *至少* 包含了 `authenticate` 方法。而其他可用的非必须返回的方法是 `payload` 和 `response`。

### `authenticate`

`authenticate` 方法的签名为 `function (request, h)`, 也是 scheme 中唯一 *必须* 有的方法。

在这里 `request` 为服务器创建的 `request` 对象。 这个对象与路由 handler 中的对象为同一个, 完整的文档可以参阅 [API reference](/api#request-object)。

`h` 是 hapi 中的 [response toolkit](https://hapijs.com/api#response-toolkit).

当身份认证成功时, 你必须调用并且返回 `h.authenticated({ credentials, artifacts })`。 `credentials` 是一个代表身份验证用户 (或者用户将要进行身份认证的凭证) 的对象。 另外 `artifacts` 包含了除用户凭证之外的其余验证信息。

`credentials` 和 `artifacts` 作为 `request.auth`对象的一部分，也可以在之后的处理过程中访问 (例如：路由 handler)。

如果身份验证不成功, 你可以抛出一个错误或者调用并返回 `h.unauthenticated(error, [data])`。 这里的 `error` 是一个身份验证错误，`data` 是一个可选对象，它包含了 `credentials` 和 `artifacts`。 如果你抛出的错误没有 `data` 对象，那么将和你调用 `return h.unauthenticated(error)` 没有什么区别。 这些错误传递的细节将会对行为有一定的影响，更多细节可以 API 文档中找到 [`server.auth.scheme(name, scheme)`](https://hapijs.com/api#-serverauthschemename-scheme)。我们推荐你使用 [boom](https://github.com/hapijs/boom) 来处理错误。

### `payload`

`payload` 方法拥有签名 `function (request, h)`。

同样，这里也可以获得到 hapi 的响应对象。 我们同样建议你使用 [boom](https://github.com/hapijs/boom) 进行错误处理。

要发出身份验证成功的信号请返回 `h.continue`。

### `response`

`response` 方法拥有签名 `function (request, h)` 也拥有 hapi标准的 response toolkit。

在响应发送会给用户之前，此方法旨在装饰响应对象 (`request.response`)，可以为其添加额外的头部信息。

当包装完毕后，你必须返回 `h.continue`, 这样响应才会被发送出去。

当错误发生时，我们依然建议你使用 [boom](https://github.com/hapijs/boom) 进行错误处理。

### 注册

注册一个 scheme 使用 `server.auth.scheme(name, scheme)`。其中 `name` 是一个字符串，用于标明特定的 scheme, 而 `scheme` 就是上文提到的方法。

## Strategies

当你注册了你的 scheme 后，你需要一种方式去使用它。这就是为什么引入了 strategies 。

正如之前提到的，strategy 其实是一个预先配置好的 scheme 实例拷贝。

使用 strategy 时, 我们必须保证有一个 scheme 已经被注册。准本好之后，你就可以使用 `server.auth.strategy(name, scheme, [options])` 去注册你的 strategy。

`name` 参数必须是一个字符串, 用于标明一个特定的 strategy。 `scheme` 其实也是一个字符串, 是实例化这个 strategy 的 scheme 的名称。

### 选项

最后的可选参数是 `options`, 这个参数将直接传递给已经命名的 scheme 。

### 设置一个默认的 strategy

你可以通过使用 `server.auth.default()` 设置一个默认的 strategy。

这个方法接受一个参数, 这个参数可以是一个默认 strategy 的名字，或者与路由handler [auth options](#route-configuration) 同样格式的对象。

请注意任何 *先于* `server.auth.default()` 添加的路由将不会被这个默认的 strategy 调用到。如果你希望默认的 strategy 被所有的路由接受，你必须在添加所有的路由之前调用 `server.auth.default()`，或者在注册 strategy 的时候使用默认模式。

## 路由配置

身份认证也可以在一个路由上通过 `options.auth` 参数进行配置。如果设置为 `false` 将会在路由上关闭身份验证。

它可以通过 strategy 将要使用的名字去配置，或者一个拥有 `mode`, `strategies`, 和`payload` 参数的对象去配置。

`mode` 参数可以被设置为 `'required'`, `'optional'`, 或者`'try'`。 这三种参数在注册 strategy 的时候方式相同。

如果 `mode` 设置为 `'required'` ，在访问路由的时候必须对用户进行身份进行验证，并且验证必须有效，否则他们将收到错误。

如果 `mode` 设置为 `'optional'` , 路由也将会使用这个 strategy 。但是用户 *不必* 进行身份验证。一旦如果验证信息提供了，那就必须是有效的。

最后 `mode` 可以被设置为 `'try'`。 `'try'` 与 `'optional'` 的区别在于：如果用 `'try'` ，不合法的身份验证是被接受的, 用户依然可以访问路由 handler。

当只需一个 strategy 时，你可以设置 `strategy` 属性为 strategy 的名字。如果指定多个 strategy 时, 参数名称必须为 `strategies`， 属性为 strategy 名称的数组。 这些 strategies 将会按照顺序执行一直到有第一个成功的, 否则的话将全部失败。

最后 `payload` 参数可以被设置为 `false` 表示内容信息不需要被认证。如果设置为 `'required'` 或者 `true` 则意味着内容 *必须* 被验证。 如果设置为 `'optional'` 意味着如果客户端一旦包含了内容认证的信息，这些信息就必须是有效的。

`payload` 只有在支持`payload` 方法的 strategy 中才会生效。
