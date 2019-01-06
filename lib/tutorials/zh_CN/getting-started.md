## 快速入门

_该教程适用于 hapi v17版本_

### 安装 hapi

新建一个目录 `myproject`:

* 运行: `cd myproject` 跳转到目录内。
* 运行: `npm init` 根据提示生成文件 package.json。
* 运行: `npm install --save hapi@17.x.x` 将安装 hapi ，并将相应的依赖并保存至 package.json 中。

就是这么简单! 你现在已经做好了创建一个 hapi 应用的全部准备。

### 创建一个Web服务器

最基本的Web服务器代码如下:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

首先引入 hapi，之后我们创建一个 web 服务器并且配置好 host 以及需要监听的端口，最后我们启动这个服务器,并且将运行的信息输出到日志中。

Web 服务器可以通过以下方式创建：指定主机名、填写IP地址、Unix socket文件或者通过Windows管道绑定到指定的服务器。更多细节内容请参考 [API reference](/api/#-server-options).

### 添加路由

现在已经有了一个简单的Web服务器，下面将添加两条路由:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        return 'Hello, ' + encodeURIComponent(request.params.name) + '!';
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

将以上代码保存至 `server.js` 之后通过命令 `node server.js`启动服务器。在浏览器中访问 [http://localhost:3000](http://localhost:3000), 你将会看到以下文本 `Hello, world!`, 之后再访问 [http://localhost:3000/stimpy](http://localhost:3000/stimpy) 你将会看到 `Hello, stimpy!`。

请注意这里使用了 URI 编码, 这可以有效地防止内容注入攻击。 因此，尽量使用内容编码去处理用户输入的信息。

`method` 可以使用任何有效的 HTTP 方法或者 HTTP 方法数组，又或者使用`*`去通配所有方法。`path` 定义了该路径下所包含的参数，可以为可选参数，数字以及通配符。更多细节内容请参考 [路由教程](/tutorials/routing).

### 建立静态内容

我们已经验证了了可以使用 Hello World 应用程序启动一个简单的hapi应用。 之后我们将使用一个名为 **inert** 的插件去创建静态页面。 在你开始之前，通过命令 **CTRL + C** 停止你的服务器。

安装 [inert](https://github.com/hapijs/inert) 使用以下命令: `npm install --save inert` 这将会下载 [inert](https://github.com/hapijs/inert) 包，并且将其添加到用于记录依赖的 `package.json` 文件中。

在你的 `server.js` 文件中修改 `init` 函数如下:

``` javascript
const init = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/hello',
        handler: (request, h) => {

            return h.file('./public/hello.html');
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
```

通过 `server.register()` 命令将插件 [inert](https://github.com/hapijs/inert) 注册到你的 hapi 应用中。

`server.route()` 将注册 `/hello` 路由, 并接收一个 GET 请求，此请求将会返回文件 `hello.html`。 这里我们在注册 `inert` 插件之后才注册路由，通常明智的做法是在注册插件后才运行依赖于插件的代码，这将在代码运行时可以确保插件已经存在。

通过 `node server.js` 启动你的服务，并在浏览器内访问[`http://localhost:3000/hello`](http://localhost:3000/hello)。哦 糟糕! 因为我们没有创建 `hello.html` 文件所以出错了。下面我们来创建缺失的文件来修正这个问题。

在你的根目录下新建一个名为 `public` 的文件夹，之后在里面创建一个名为 `hello.html` 的文件。 `hello.html` 内代码如下:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hapi.js is awesome!</title>
  </head>
  <body>
    <h1>Hello World.</h1>
  </body>
</html>
```

这是一份简单并符合规范的 HTML5 文档。

在浏览器内重新载入这个页面，你将会看到标题 "Hello World."。

当你对硬盘上的文件作出修改的时候 [Inert](https://github.com/hapijs/inert) 将会自动重新加载这些文件。 你可以根据自己的喜好调整这个页面。

更多关于静态内容的细节请访问 [静态内容](/tutorials/serving-files)。这项技术一般用于图片，css样式文件以及静态页面。

### 使用插件

日志对于 Web 开发的重要性毋庸置疑，我们通过 [hapi pino](https://github.com/pinojs/hapi-pino) 插件为应用提供日志服务。

通过npm安装所需要的插件:

```bash
npm install hapi-pino
```

之后修改 `server.js` 如下:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        // request.log(['a', 'name'], "Request name");
        // or
        request.logger.info('In handler %s', request.path);

        return `Hello, ${encodeURIComponent(request.params.name)}!`;
    }
});

const init = async () => {

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: ['response', 'onPostStart']
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

```

当服务器启动的时候你将会看到以下内容:

```sh
[2017-12-03T17:15:45.114Z] INFO (10412 on box): server started
    created: 1512321345014
    started: 1512321345092
    host: "localhost"
    port: 3000
    protocol: "http"
    id: "box:10412:jar12y2e"
    uri: "http://localhost:3000"
    address: "127.0.0.1"
```

之后在浏览器内访问 [http://localhost:3000/](http://localhost:3000/) 我们可以看到请求的信息已经输出到了终端中。

日志可以通过 `options` 配置并注册到服务中。

很好! 这只是使用插件的一个简短示例, 更多信息请查看插件教程 [插件教程](/tutorials/plugins)。

### 其他

hapi 拥有许多其他的功能，此教程只记录了其中少数几个功能，你可以在右侧的列表中找到它们。 其余内容请参阅 [API reference](/api)。 欢迎在 [github](https://github.com/hapijs/discuss/issues) 提问，或者在 [slack](https://join.slack.com/t/hapihour/shared_invite/enQtNTA5MDUzOTAzOTU4LTUyZmFiYjkyMTBmNDcyMmI2MmRjMzg4Y2YzNTlmNzUzNjViN2U1NmYyY2NjYjhiYWU4MGE2OTFhZDRlYWMyZDY) 找到我们。
