## 视图

_该教程适用于 hapi v17版本_

hapi 对模板渲染有广泛的支持，包括加载以及使用多个模板引擎、部分渲染、辅助工具 (模板中用于操作数据的函数)以及布局功能。这些功能由 [vision](https://github.com/hapijs/vision) 插件提供。

## 配置服务器

如果要使用视图，首先需要在服务器上配置一个模板引擎。 这可以通过 vision 提供的 [`server.views()`](https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions) 方法来完成:

```javascript
'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');

const server = Hapi.server();

const start = async () => {

    await server.register(require('vision'));

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates'
    });
};

start();
```

我们在这里做了许多工作：
首先，我们加载 [vision](https://github.com/hapijs/vision) 插件，它可以为hapi提供模板渲染引擎。

其次，我们注册 `handlebars` 模块为引擎提供渲染 `.html` 文件的能力。

最后，我们告诉服务器我们的模板在 `templates` 目录下。我们可以通过 `relativeTo` 选项指定相对路径，默认情况下 hapi 在当前工作目录下查找模板文件。

### 视图选项

hapi 的视图引擎有众多的选项。完整的文档可以在这里找到 [vision API reference](https://github.com/hapijs/vision/blob/master/API.md#serverviewsoptions)，我们这里只示例一部分。

这些选项可以全局配置，也可以配置给指定的引擎，例如：

```javascript
server.views({
    engines: {
        html: {
            module: require('handlebars'),
            compileMode: 'sync' // 引擎特定配置
        }
    },
    compileMode: 'async' // 全局配置
});
```

### 引擎

如果需要在 hapi 中使用视图，你需要在服务器中至少注册一个模板引擎。引擎可以是同步的也可以是异步的，并且这个对象需要以 `compile` 为名导出。

同步引擎 `compile` 方法的签名为 `function (template, options)`。 并且这个方法需要返回一个签名为 `function (context, options)` 的函数，在函数内或者抛出错误或者返回编译后的 html 文件。

异步引擎 `compile` 方法的签名为 `function (template, options, callback)` 它以标准错误优先格式调用 `callback` 并返回一个带有签名`function (context，options，callback)` 的新方法。返回的方法也应该以错误优先格式调用 `callback`，而编译的 html 是第二个参数。

默认情况下 hapi 认为所有的模板引擎都是同步的 (例如 `compileMode` 默认是 `sync`), 如果使用异步引擎你需要将 `compileMode` 设置为 `async`。

想要修改两种 `compile` 方法中的 `options` 参数或者返回方法，可以通过 `compileOptions` 和 `runtimeOptions`设置来完成。这两个选项都默认为空对象 `{}`。
`compileOptions` 是作为第二个参数传递给 `compile` 的对象, 而 `runtimeOptions` 传递给 `compile` 返回的方法。

如果只注册了一个模板引擎，他将自动成为默认值，允许在渲染视图的时候不使用文件扩展名。但是如果过注册了多个模板引擎，则必须使用文件扩展名，或者将 `defaultExtension` 设置为最常用的引擎。对于不使用默认引擎的任何视图，依然需要指定文件扩展名。

另外一个有用的选项是 `isCached`。如果设置为 `false` ， hapi 将不会缓存模板引擎渲染的结果，而是每次都去读取模板文件并渲染。 在开发你的应用时, 这个设置非常方便，它可以防止您在处理模板时重新启动应用程序。 我们建议在生产环境中将 `isCached` 的值设置为 `true` 。

### 路径

由于视图可以包含多个不同位置的文件, 因为hapi 提供了一些选项帮助你配置多个路径用于内容查找:

- `path` : 包含你主要模板的路径
- `partialsPath` : 部分内容的路径
- `helpersPath` : 模板辅助工具的路径
- `layoutPath` : 布局模板的路径
- `relativeTo` : 用于指定其他路径的前缀。当指定后，其余路径则都可以相对于此路径

此外, 还有两个设置可以改变 hapi 允许你使用路径的方式。默认情况下，不允许使用绝对路径和遍历 `path` 目录，但是可以通过将 `allowAbsolutePaths` 和 `allowInsecureAccess` 设置为 true 来开启这些功能。

例如你的目录结构如下:

```
templates\
  index.html
  layout\
    layout.html
  helpers\
    getUser.js
    fortune.js
```

你可以如下去配置:

```javascript
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './templates',
    layoutPath: './templates/layout',
    helpersPath: './templates/helpers'
});
```

## 渲染一个视图

渲染一个视图有两种选择：你可以使用 `h.view()` 方法，这里的 `h` 是 [response toolkit](/api#response-toolkit) 。而另一种方法是通过视图 handler。

### [`h.view()`](https://github.com/hapijs/vision/blob/master/API.md#hviewtemplate-context-options)

首先我们来看一下如何使用 `h.view()` 渲染视图。 使用这种方法的路由配置如下:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        return h.view('index');
    }
});
```

你可以通过第二个参数向 `h.view()` 传递要渲染的内容，如:

```javascript
return h.view('index', { title: 'My home page' });
```

### 视图 handler

第二种是可以通过使用 hapi 内建的视图 handler 来渲染。 这种方式的路由如下配置:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: 'index'
    }
});
```

当使用视图 handler 时,内容作为 `context` 的值传入, 如:

```json5
handler: {
    view: {
        template: 'index',
        context: {
            title: 'My home page'
        }
    }
}
```

### 全局内容

我们已经知道了如何传递内容去一个视图，但是我们有一些默认的内容 *都必须* 显示在所有的模板上该如何呢?

最简单的方式是在调用 `server.views()` 使用 `context` 选项 :

```javascript
const context = {
    title: 'My personal site'
};

server.views({
    engines: {
        html: {
            module: require('handlebars'),
            compileMode: 'sync' // engine specific
        }
    },
    context
});
```

这个默认的全局内容将会以最低的优先级合并到你所有的视图中。

### 视图辅助工具

位于定义在 `helpersPath` 中的 JavaScript 模块可以在模板中使用。在这个例子中，我们将创建一个视图 helper `fortune`，当在模板中使用时，它将从字符串数组中挑选并打印出一个元素。

下面的代码片段是完整的帮助函数，我们将它存储在 `helpers` 目录中名为 `fortune.js` 的文件中。

```javascript
module.exports = function () {

    const fortunes = [
        'Heisenberg may have slept here...',
        'Wanna buy a duck?',
        'Say no, then negotiate.',
        'Time and tide wait for no man.',
        'To teach is to learn.',
        'Never ask the barber if you need a haircut.',
        'You will forget that you ever knew me.',
        'You will be run over by a beer truck.',
        'Fortune favors the lucky.',
        'Have a nice day!'
    ];

    const x = Math.floor(Math.random() * fortunes.length);
    return fortunes[x];
};
```

现在我们可以在模板中使用刚刚创建的视图助手。 这里是一个在 `templates/index.html` 使用 handlebars 作为渲染引擎的代码示例:

```html
<h1>Your fortune</h1>
<p>{{fortune}}</p>
```

现在，当我们启动服务器并用浏览器访问使用我们模板的路径（使用我们的视图helper）时，我们应该会在标题下方看到一个随机显示的段落。

作为参考，这是一个完整的服务器代码，它将在模板中使用 fortune 视图 helper 方法。

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({ port: 8080 });

const start = async () => {

    await server.register(require('vision'));

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates',
        helpersPath: 'helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {

            return h.view('index');
        }
    });
};

start();
```

### 布局

vision 对于视图布局有一些内建的支持，这个功能默认是关闭的，因为它可能会和一些特定的模板引擎冲突，因此我们建议只使用一种布局系统。

如果要使用内建的布局系统，首先需要设置视图引擎:

```javascript
server.views({
    // ...
    layout: true,
    layoutPath: 'templates/layout'
});
```

这将开启内建的布局系统，并且将默认的布局页定义在 `templates/layout/layout.html` (或者你正在使用的其他扩展名)。

在你的 `layout.html` 中设置一块内容区域:

```html
<html>
  <body>
    {{{content}}}
 </body>
</html>
```

之后你的视图应该只包含有:

```html
<div>Content</div>
```

当渲染这个视图时 `{{{content}}}` 将会被视图中的内容替换。

你可以通过全局配置来修改这个默认布局:

```javascript
server.views({
    // ...
    layout: 'another_default'
});
```

你也可以为每一个视图指定一个布局:

```javascript
return h.view('myview', null, { layout: 'another_layout' });
```
