## Cookies

_该教程适用于 hapi v17版本_

当创建一个 web 应用时, cookies 通常用于保存一个用户在每个请求之间的状态。在 hapi 中, cookies 可以被灵活、安全以及便捷的使用。

## 配置服务器

hapi 有许多配置选项用于处理 cookies。默认的配置已经可以适用于大多数场景了，当然也可以在需要时进行替换。

使用 cookie, 首先你需要调用 [`server.state(name, [options])`](/api#-serverstatename-options)来配置。这里`name` 是 cookie 的名字, `options` 是用来配置 cookie 的对象。

```javascript
server.state('data', {
    ttl: null,
    isSecure: true,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});
```

这份配置将 cookie 命名为 `data` ，它拥有一个 session 生命周期 (当浏览器关闭时将被删除)，它标记为安全以及只支持 HTTP (参见 [RFC 6265](http://tools.ietf.org/html/rfc6265)，的章节 [4.1.2.5](http://tools.ietf.org/html/rfc6265#section-4.1.2.5) 以及 [4.1.2.6](http://tools.ietf.org/html/rfc6265#section-4.1.2.6) 以了解这个标记的更多信息)， 之后告诉 hapi 内容是 base64 编码的JSON字符串。关于 `server.state()` 的完整文档可以在 [the API reference](/api#serverstatename-options) 中找到。

除此之外，你也可以通过路由级别的两个属性更以进一步的配置 cookie 的行为，这两个属性位于路由的 `options.state` 对象中:

```json5
{
    config: {
        state: {
            parse: true,        // 解析 cookies 并储存在 request.state
            failAction: 'error' // 也可以为 'ignore' 或者 'log'
        }
    }
}
```

## 设置一个 cookie

cookie 的设置可以通过 [response toolkit](/api#response-toolkit)。这个设置可以在请求的 handler, 预处理或者请求生命周期的扩展的位置中使用，示例如下:

```javascript
h.state('data', { firstVisit: false });
return h.response('Hello');
```

这个例子中, hapi 将会返回字符串 `Hello` 同时也设置一个 cookie 名为 `data` 内容为 `{ firstVisit: false }` 的 base64 编码的 JSON 字符串。

`state()` 方法也可以在 [response 对象](/api#response-object) 中使用，这样可以方便链式调用，使用的例子如下:

```javascript
return h.response('Hello').state('data', { firstVisit: false });
```

### 重载选项

当设置 cookie 的时候，您也可以将 `server.state()` 可用的选项作为第三个参数传递，例如

```javascript
return h.response('Hello').state('data', 'test', { encoding: 'none' });
```

这个例子中 cookie 将会被简单的设置为字符串 `"test"` 而不使用任何编码。

## 获取一个 cookie 的值

在路由 handler，预处理或请求生命周期扩展的位置中通过 `request.state` 可以访问 cookie 的值。

`request.state` 对象包含了解析后的 HTTP 状态。每一个键代表了 cookie 的名字，而值代表了定义的内容。

```javascript
const value = request.state.data;
// console.log(value) 将会得到 { firstVisit : false }
```

示例代码使用了 `data` cookie 键，而相关的值被设定为了 `{ firstVisit: false }`.

## 清理一个 cookie
cookie 可以通过调用 `unstate()` 来清理，这个方法在[response toolkit](/api#response-toolkit) 或者[response object](/api#response-object) 中:

```javascript
return h.response('Bye').unstate('data');
```

