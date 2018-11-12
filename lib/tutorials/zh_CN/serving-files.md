## 静态内容

_该教程适用于 hapi v17版本_

在构建任意一个 web 应用时，不可避免的需要从磁盘提供一些静态文件。有一个名为 [inert](https://github.com/hapijs/inert) 的 hapi 插件可以完成这个操作。

首先你需要安装它，并且将 inert 作为依赖添加到你的项目中:

`npm install --save inert`

## `h.file(path, [options])`

首先我们看如何使用 [`h.file()`](https://github.com/hapijs/inert#hfilepath-options) 方法:

```javascript
const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('/path/to/picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

如上所示，这就是你返回 `h.file(path)` 的基本方式。

### 相对路径

为了简化操作，特别是如果有多个需要返回文件的路由，你可以在服务器中配置基本路径，之后只将相对路径传递给 `h.file()`:

```javascript
'use strict';

const Hapi = require('hapi');
const Path = require('path');

const server = Hapi.server({
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
});

const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

当在 `server.options.routes` 中设置一个选项时，如上所述，它将应用于 _所有的_ 路由。你还可以修改这些选项，包括每个路由级别的 `relativeTo` 选项。

## 文件 handler

上述路由的替代方法是使用 `file` handler:

```javascript
server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: {
        file: 'picture.jpg'
    }
});
```

### 文件 handler 选项

我们还可以将参数指定为接受 `request` 对象，并返回表示文件路径字符串的函数 (绝对路径或者相对路径):

```javascript
server.route({
    method: 'GET',
    path: '/{filename}',
    handler: {
        file: function (request) {
            return request.params.filename;
        }
    }
});
```

它也可以是具有 `path` 属性的对象。当在 handler 中使用对象时，我们可以附加一些别的东西，如设 `Content-Disposition` 头并允许压缩文件。如下: 

```javascript
server.route({
    method: 'GET',
    path: '/script.js',
    handler: {
        file: {
            path: 'script.js',
            filename: 'client.js', // 修改 Content-Disposition 头中的文件名
            mode: 'attachment', // 指定 Content-Disposition 是一个附件
            lookupCompressed: true // 如果请求允许，将允许查找 script.js.gz
        }
    }
});
```

## 目录 handler

除 `file` handler 之外，inert 也有一个额外的 `directory` handler 允许一个路由提供多份文件。要使用它，必须使用参数指定路径。 参数的名称无关紧要，你也可以在参数上使用星号扩展名来限制文件的深度。目录 handler 的基本用法如下:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});
```

### 目录 handler 选项

上述路由将通过在 `public` 目录中查找匹配的文件名来响应任何请求。这里需要注意的是，在此配置中对 `/` 的请求将会使用 HTTP `403` 响应进行回复。我们可以通过添加索引文件的方式来解决这个问题。默认情况下，hapi 会在目录中搜索名为 `index.html` 的文件。我们可以通过将 index 选项设置为 `false` 来禁用提供索引文件，或者我们可以指定 inert 可以查找的索引文件数组:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            index: ['index.html', 'default.html']
        }
    }
});
```

一个发往 `/` 的请求首先尝试去加载 `/index.html`, 之后再加载 `/default.html`。当没有可用的索引文件时, inert 可以以列表的形式显示这个目录下的内容。你可以通过设置 `listing` 属性为 `true` 来开启这个选项，如:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: true
        }
    }
});
```
现在，对 `/` 的请求将会回复一个显示目录内容的 HTML。使用启用了列表的目录 handler 时，默认情况下隐藏文件不会显示在列表中，可以通过将 `showHidden` 选项设置为 `true` 来显示。与文件 handler 一样，目录 handler 也有一个 `lookupCompressed` 的选项用于提供预压缩文件。你还可以设置一个 `defaultExtension`，如果找不到原始路径，它将附加到请求中。这意味着对 `/bacon` 的请求也会尝试文件 `/bacon.html`。
