## 插件

_该教程适用于 hapi v17版本_

hapi 拥有一个可扩展并且强健的插件系统，它允许你将应用分割为独立的业务逻辑或者可重用的组件。

## 创建一个插件

插件很容易去实现，它的核心是一个拥有 `register` 属性的对象。属性的值是一个拥有 `async function (server, options)` 签名的函数。 除此之外，插件必须拥有 `name` 属性以及多个包括 `version` 在内的可选属性。

一个简单的插件如下:

```javascript
'use strict';

const myPlugin = {
    name: 'myPlugin',
    version: '1.0.0',
    register: async function (server, options) {

        // 创建一个路由作为示例

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'hello, world';
            }
        });

        // etc ...
        await someAsyncMethods();
    }
};
```

当作为一个外部模块时, 你需要指定 `pkg` 属性:

```javascript
'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options) {

        // 创建一个路由作为示例

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'hello, world';
            }
        });

        // etc...
        await someAsyncMethods();
    }
};
```

请注意在第一个例子中，我们显示的设定了 `name` 和 `version` 属性, 然而在第二个例子中，我们将 package.json 中的内容设置为 `pkg` 属性的值。两种方法都是可以的。

当作为模块编写时, 插件可以作为模块被导出，如 `module.exports = { register, name, version }` 。如果你希望你的模块以多个hapi插件导出时，可以 `exports.plugin = { register, name, version }`。

除此之外，当一个插件的 `multiple` 属性设置为 `true`的时候，这表明一个插件可以被重复注册多次。

另外一个可用的属性是`once`，当它设置为 `true` 时意味着 hapi 将会忽略掉之后的注册，并且也不会抛出错误。

### 注册方法

综上所述， `register` 方法接受两个参数， `server` 和 `options`。

`options` 参数只是用户在调用 `server.register(plugin, options)` 时传递给插件的选项内容。不做任何更改，这个对象将直接传递给 `register` 方法。

`register` 应为异步函数，一旦你的插件完成了注册的所有步骤后它将被返回。 另外当注册插件出现异常时，需要抛出一个错误。

`server` 对象是需要载入你的插件的 `server` 对象的引用。

## 载入一个插件

插件可以一次载入一个，也可以通过方法 `server.register()` 分组载入, 例如:

```javascript
const start = async function () {

    // 载入一个插件

    await server.register(require('myplugin'));

    // 载入多个插件

    await server.register([require('myplugin'), require('yourplugin')]);
};
```

要将选项传递给插件时，我们将传递一个拥有 `plugin` 和 `options` 作为键的对象, 例如:

```javascript
const start = async function () {

    await server.register({
        plugin: require('myplugin'),
        options: {
            message: 'hello'
        }
    });
};
```

这些对象也可以以数组的方式传入:

```javascript
const start = async function () {

    await server.register([{
        plugin: require('plugin1'),
        options: {}
    }, {
        plugin: require('plugin2'),
        options: {}
    }]);
};
```

### 注册选项

你也可以传递第二个可选参数到 `server.register()`。 关于这个对象的文档可以在 [API reference](/api#-await-serverregisterplugins-options) 中找到。

options 对象将被 hapi 使用，并且 *不会* 传递到被装载的插件中。它可以将`vhost`或`prefix`修饰符添加到使用插件的路由上。

例如我们有这样一个插件:

```javascript
'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options) {

        server.route({
            method: 'GET',
            path: '/test',
            handler: function (request, h) {

                return 'test passed';
            }
        });

        // 其他...
        await someAsyncMethods();
    }
};
```

通常来说, 当插件载入的时候将会创建一个 `GET` 路由在 `/test` 路径上。 我们可以通过添加 `prefix` 的值来修改任意使用这个插件生成的路由。 

```javascript
const start = async function () {

    await server.register(require('myplugin'), {
        routes: {
            prefix: '/plugins'
        }
    });
};
```

现在当插件被载入时, 因为修改了 `prefix` ，`GET` 路由将注册为 `/plugins/test`.

与之类似，通过修改 `options.routes.vhost` 属性，将为所有使用插件创建的路由分配默认的 `vhost`配置。 更多关于 `vhost` 的配置信息可以在这里找到 [API reference](/api#-serverrouteroute).
