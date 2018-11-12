## Plugins

_이 튜터리얼은 hapi v17과 호환됩니다._

hapi는 막대하고 강력한 플러그인 시스템을 가지고 있어 응용프로그램을 쉽게 독립된 비즈니스 로직 부분과 재사용 가능한 유틸리티 부분으로 쉽게 나눌 수 있습니다.

## 플러그인 만들기

플러그인은 작성하기에 매우 간단합니다. 그 중심에 `async function (server, options)` 형태의 `register` 함수를 가진 객체가 있습니다. 추가로 플러그인 객체는 `name`이라는 필수 속성과 `version`을 포함한 몇 가지 선택적인 속성을 가지고 있습니다.

매우 간단한 플러그인은 다음과 같습니다.:

```javascript
'use strict';

const myPlugin = {
    name: 'myPlugin',
    version: '1.0.0',
    register: async function (server, options) {

        // Create a route for example

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

또는 외부 모듈처럼 작성할 때, `pkg` 속성을 정의할 수 있습니다.:

```javascript
'use strict';

exports.plugin = {
    pkg: require('./package.json'),
    register: async function (server, options) {

        // Create a route for example

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

첫 번째 예제에서 명확하게 `name`과 `version`을 설정했지만, 두 번째 예제에서는 값으로 package.json의 내용으로 `pkg` 인자를 설정했습니다. 두 방법 모두 가능합니다.

모듈로 작성할 때, 플러그인은 예를 들어 `module.exports = { register, name, version }`처럼 최상위 모듈 내보내기 또는 hapi 플러그인 이상으로 내보내기 위한 모듈을 원한다면 `exports.plugin = { register, name, version }` 으로 쓸 수 있습니다.

추가적으로 플러그인 객체는 `multiple` 속성을 포함할 수 있습니다. 이 속성이 `true`로 설정되면 hapi에게 해당 플러그인이 같은 서버에서 여러번 등록되도 안전하다는 것을 알립니다.

다른 사용 가능한 속성은 `once`입니다. 이 속성이 `true`로 설정되면 hapi는 에러를 발생하지 않고 같은 플러그인의 두 번째 등록을 무시합니다.

### The register method

위에서 본 것처럼 `register` 메소드는 `server`, `options` 2개의 인자를 받습니다.

`options` 인자는 `server.register(plugin, options)` 호출할 때 전달한 모든 옵션을 플러그인에 전달합니다. 변경되는 것 없이 객체가 `register` 메소드로 바로 전달됩니다.

`register`는 플러그인이 등록될 때 필요한 모든 단계를 완료되면 반환하는 aync 함수이어야 합니다. 또는 플러그인을 등록하는 동안 에러가 발생하면 에러를 발생시켜야 합니다.

`server` 객체는 플러그인을 적재하는 `server`에 대한 참조입니다.

## 플러그인 적재

플러그인은 `server.register()` 메소드로 한 번에 하나씩 또는 배열의 그룹으로 적재될 수 있습니다. 예를 들면 다음과 같습니다.:

```javascript
const start = async function () {

    // load one plugin

    await server.register(require('myplugin'));

    // load multiple plugins

    await server.register([require('myplugin'), require('yourplugin')]);
};
```

플러그인에 옵션을 전달하기 위해서, `register`와 `options` 키를 가지는 객체를 다음과 같이 대신 전달합니다.:

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

이 객체들은 배열로 전달될 수도 있습니다.:

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

### 등록 옵션

두 번째 선택적인 인자를 `server.register()`에 전달할 수 있습니다. 이 객체에 대한 문서는 [API reference](/api#-await-serverregisterplugins-options)에서 찾을 수 있습니다.

options 객체는 로드될 플러그인에 전달되지 *않고* hapi에서 사용됩니다. 이는 플러그인이 등록된 어떤 경로에 `vhost` 또는 `prefix` 수정자를 적용할 수 있습니다.

예를 들면 다음과 같은 플러그인이 있다고 가정합니다.:

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

        // etc...
        await someAsyncMethods();
    }
};
```

보통 이 플러그인이 로드되면 `/test`에 `GET` 경로가 생성됩니다. options에 `prefix`를 사용하면 플러그인에서 생성한 모든 경로에 문자열이 추가는 것으로 변경됩니다.

```javascript
const start = async function () {

    await server.register(require('myplugin'), {
        routes: {
            prefix: '/plugins'
        }
    });
};
```

이제 플러그인이 로드될 때 `prefix` 옵션 때문에 `/plugins/test`에 `GET` 경로가 만들어질 것입니다.

비슷하게 `options.routes.vhost` 인자는 플러그인이 로드될 때 생성된 경로의 기본 `vhost`를 설정합니다. `vhost` 설정에 대한 자세한 내용은 [API reference](/api#-serverrouteroute)에서 찾을 수 있습니다.
