## 服务器方法

_该教程适用于 hapi v17版本_

服务器方法是一种非常有用的函数共享方式，与引入公用的模块不同，它只需附加在服务器对象上。注册一个服务器方法，你只需调用 [`server.method()`](https://hapijs.com/api#server.method())。 有两种方式调用这个函数，你可以通过方法 `server.method(name, method, [options])` 调用, 如:

```javascript
const add = function (x, y) {

    return x + y;
};

server.method('add', add, {});
```

又或者你可以通过方法 `server.method(method)`调用, 这里 `method` 是一个拥有 `name`, `method` 以及 `options` 参数的对象 (注意你也可以传递以上对象的数组):

```javascript
const add = function (x, y) {

    return x + y;
};

server.method({
    name: 'add',
    method: add,
    options: {}
});
```

### 名称

`name` 参数是一个字符串，用于之后在服务器中通过 `server.methods[name]` 访问这个方法。注意如果你指定了一个 `name` 含有一个 `.` 字符, 它注册了一个内嵌对象，而不是一个字符串字面值，如:

```javascript
server.method('math.add', add);
```

这个服务器方法可以通过 `server.methods.math.add()` 来调用。

### 函数

`method` 参数是当服务器方法被执行时实际调用的函数，它可以携带任意数量的参数，也可以是一个 `async` 函数，例如:

```js
const add = async function (x, y) {

    const result = await someLongRunningFunction(x, y);
    return result;
};

server.method('add', add, {});
```

你的服务器方法函数应该返回一个有效的结果，又或者当异常发生时抛出一个错误。

## 缓存

服务器方法的一个主要优点是它们可以利用 hapi 的本机缓存。默认情况下不缓存，但是如果在注册方法时传递了相应的配置，则返回值将会被缓存。返回的结果将从缓存中获取这个值，而不是每次调用时重新运行方法。配置如下所示:

```javascript
server.method('add', add, {
    cache: {
        expiresIn: 60000,
        expiresAt: '20:30',
        staleIn: 30000,
        staleTimeout: 10000,
        generateTimeout: 100
    }
});
```

参数可以是：

* `expiresIn`: 以项目保存在缓存中的时间起，超过这个时间将失效。其中时间以毫秒数表示，不能与 `expiresAt`一同使用。
* `expiresAt`: 使用以 'HH:MM' 格式以24小时为指定时间, 这个时间之后路由所有的缓存记录都将失效。这个时间使用本地时间，不能与 `expiresIn` 一同使用。
* `staleIn`: 缓存失效时，尝试重新生成它毫秒数，必须小于 `expiresIn`。
* `staleTimeout`: 在 generateFunc 生成新值时返回之前，可以允许返回过期值的毫秒数。
* `generateTimeout`: 当返回时间太长时，如返回超时错误之前，等待的毫秒数。但当这个值最终被返回时，它将储存在缓存中以便将来的请求使用。
* `segment`: 用于隔离缓存项的可选分段名称。
* `cache`: 一个可选字符串，其中包含要使用的服务器上配置的缓存连接的名称。

更多关于缓存的选项的信息可以通过 [API Reference](/api#servermethodmethod) 以及 [catbox](https://github.com/hapijs/catbox#policy) 中找到。

通过设置 `ttl` 标记，可以修改每次调用服务器方法结果的 `ttl` (生存时间)。我们来看一下如何让它与之前的例子工作: 

```js
const add = async function (x, y, flags) {

    const result = await someLongRunningFunction(x, y);

    flags.ttl = 5 * 60 * 1000; // 5 mins

    return result;
};

server.method('add', add, {
    cache: {
        expiresIn: 2000,
        generateTimeout: 100
    }
});

server.methods.add(5, 12);
```

这里，我们定义了我们的服务器方法函数，这里多传递了一个参数，这个额外的 `flags` 参数由 hapi 提供。然后，只需将 `ttl` 标记的值设置为我们希望结果被缓存的时间 (以毫秒为单位)即可。 如果这个值被设为 `0` 那么返回的结果将永远不会被缓存。如果我们没有设置，那么 `ttl` 将从缓存的配置中获取。

### 自定义缓存键

除上述选项外，你还可以指定一个自定义函数，用于根据方法的参数来生成缓存的键。如果你的方法参数是由字符串、数字和布尔值构成的组合，那么 hapi 将会为你生成适用的键。但是，如果你的方法接受对象参数，则你需要指定一个如下类似用于生产键的函数:

```javascript
const sum = function (array) {

    let total = 0;

    array.forEach((item) => {

        total += item;
    });

    return total;
};

server.method('sum', sum, {
    generateKey: (array) => array.join(',')
});
```

这样传递给方法的任何参数都可用于 `generateKey` 方法。

### 绑定

服务器方法可用的最后一个选项是 `bind`。`bind` 选项可以修改方法中的 `this` 上下文。添加方法时，它默认为当前上下文。这对于传入数据库数据库客户端非常有用，因为无需将其作为参数传递，并且不用自定义 `generateKey` 函数，如下:

```javascript
const lookup = async function (id) {

    // 调用 myDB.getOne

    return await this.getOne({ id });
};

server.method('lookup', lookup, { bind: myDB });
```
