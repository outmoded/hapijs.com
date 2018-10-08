## 日志

_该教程适用于 hapi v17版本_

对于软件开发而言，日志的重要性不言而喻。 hapi 内建的日志方法已经基本可以满足日常开发的需要。

### 内建方法

在你的应用程序内，你可以使用 [`server.log(tags, [data, [timestamp]])`](/api#-serverlogtags-data-timestamp), 以及[`request.log(tags, [data])`](https://hapijs.com/api#-requestlogtags-data) 这两种日志方法。 你可以通过调用 `request.log()` 记录一个请求的上下文信息。 例如在路由的处理过程中. 记录请求的生命周期扩展以及授权方案。你也可以通过调用 `server.log()` 记录除请求之外的其余信息。 例如服务的启动信息以及插件的 `register()` 方法。

以上两种方法前两个参数都一样，分别是 `tags` 和 `data`。

`tags` 可以是一个字符串或者字符串数组用于鉴别事件。 你可以把它当作日志等级，或者添加更多可描述的内容。 例如：记录一个从数据库中的读取错误你可以这样写：

```javascript
server.log(['error', 'database', 'read']);
```

hapi 中所有生成的日志事件，都会有一个 `hapi` 标签。

第二个参数 `data` 是一个可选的字符串或者对象。 这里你可以传入错误信息，或者其余相关细节。

除此之外 `server.log()` 可以接受 `timestamp` 作为第三个参数。 它的默认值是 `Date.now()`, 除非有特殊的原因，我们不建议你覆盖这个默认值。

### 检索以及显示日志

hapi 服务器对象为每个日志事件都发出了事件。你可以通过标准的 EventEmitter API 去监听这些事件并做处理。


```javascript
server.events.on('log', (event, tags) => {

    if (tags.error) {
        console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
    }
});
```

调用 `server.log()` 时将会发出 `log` 事件，而调用 `request.log()` 时将会发出一个 `request` 事件。

你可以通过 `request.logs` 一次性获取到所有日志。 这将返回一个包含所有请求日志事件的数组。想要使用这个功能需要将路由的 `log.collect` 选项设置为 `true`，否则只能得到一个空的数组。

```javascript
server.route({
    method: 'GET',
    path: '/',
    options: {
        log: {
            collect: true
        }
    },
    handler: function (request, h) {

        return 'hello';
    }
});
```

### Debug 模式 (只针对开发)

hapi 拥有 debug 模式, 它可以直接显示所有日志事件到控制台，而不需要额外去配置或者使用一些插件。

默认情况，debug 模式只会输出应用未捕获的错误、运行时错误以及错误实现hapi API所带来错误等。你可以在服务器配置中配置 debug 模式需要打印哪些 tag 的错误。例如你想将所有请求中的错误信息在 debug 模式中输出，可以如下配置:

```javascript
const server = Hapi.server({ debug: { request: ['error'] } });
```

更多关于 debug 模式的信息请参阅 [API documentation](https://hapijs.com/api#-serveroptionsdebug).

## 日志插件

hapi 内建的日志方法已经基本满足了开发的需求。如果需要更多的日志功能，可以使用如[good](https://github.com/hapijs/good)之类的日志插件。
