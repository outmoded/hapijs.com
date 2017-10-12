## 플러그인

hapi는 막대하고 강력한 플러그인 시스템을 가지고 있어 응용프로그램을 쉽게 독립된 비즈니스 로직 부분과 재사용 가능한 유틸리티 부분으로 쉽게 나눌 수 있습니다.

## 플러그인 만들기

플러그인은 작성하기에 매우 간단합니다. 그 중심에 `function (server, options, next)` 형태의 `register` 함수를 가진 객체가 있습니다. `register` 함수는 hapi에 이름과 버전 같은 플러그인 관련 추가적인 정보를 담고 있는 `attributes` 객체를 가지고 있습니다.

매우 간단한 플러그인은 다음과 같습니다.:

```javascript
'use strict';

const myPlugin = {
    register: function (server, options, next) {
        next();
    }
};

myPlugin.register.attributes = {
    name: 'myPlugin',
    version: '1.0.0'
};
```

또는 외부 모듈처럼 작성하면:

```javascript
'use strict';

exports.register = function (server, options, next) {
    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
```

첫 번째 예제에서 명확하게 `name`과 `version`을 설정했지만, 두 번째 예제에서는 값으로 package.json의 내용으로 `pkg` 인자를 설정했습니다. 두 방법 모두 가능합니다. 

또한 `attributes` 객체는 `true`로 설정하여 같은 서버에서 플러그인이 여러 번 등록되도 안전하다는 것을 hapi에 알려주는 `multiple` 키를 포함할 수 있습니다. 

### register 메소드

위에서 본 것처럼 `register` 메소드는 `server`, `options`, `next` 3개의 인자를 받습니다. 

`options` 인자는 사용자가 전달한 모든 옵션을 플러그인에 전달합니다. 변경되는 것 없이 객체가 `register` 메소드로 바로 전달됩니다.  

`next`는 플러그인이 등록되는 동안 필요한 모든 단계가 완료되면 호출됩니다. 이 메소드는 플러그인을 등록하는 동안 에러가 발생하면 정의되는 `err`라는 하나의 인자를 받아들입니다.

`server` 객체는 플러그인을 적재하는 `server`의 참조입니다.

#### `server.select()`

서버는 레이블이 지정된 연결을 가질 수 있습니다.

```javascript
const server = new Hapi.Server();
server.connection({ labels: ['api'] });
```

이 레이블은 `server.select()` 메소드를 사용하여 특정 연결에만 다른 설정과 플러그인을 적용하는데 사용될 수 있습니다.

예를 들어 `'api'` 레이블을 가진 연결에만 경로를 추가하려면 다음을 사용합니다.:

```javascript
const api = server.select('api');

api.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('api index');
    }
});
```

논리적 OR 구문으로 동작하는 문자열의 배열을 전달하는 것으로 동시에 여러 레이블을 선택할 수 있습니다. 논리적 AND로 동작하려면 다음과 같이 `server.select()`를 연결해서 호출합니다.:

```javascript
// all servers with a label of backend OR api
const myServers = server.select(['backend', 'api']);

// servers with a label of api AND admin
const adminServers = server.select('api').select('admin');
```

`server.select()`의 결과 값은 선택한 연결만을 포함한 서버 객체입니다.

## 플러그인 로드하기

플러그인은 `server.register()` 메소드로 한 번에 하나씩 또는 배열의 그룹으로 로드될 수 있습니다. 예를 들면 다음과 같습니다.:

```javascript
// load one plugin
server.register(require('myplugin'), (err) => {
    if (err) {
        console.error('Failed to load plugin:', err);
    }
});

// load multiple plugins
server.register([require('myplugin'), require('yourplugin')], (err) => {
    if (err) {
        console.error('Failed to load a plugin:', err);
    }
});
```

플러그인에 옵션을 전달하기 위해서, `register`와 `options` 키를 가지는 객체를 다음과 같이 대신 생성합니다.:

```javascript
server.register({
    register: require('myplugin'),
    options: {
        message: 'hello'
    }
}, (err) => {

    if (err) {
        throw err;
    }
});
```

이 객체들은 배열로 전달 될 수도 있습니다.:

```javascript
server.register([{
    register: require('plugin1'),
    options: {}
}, {
    register: require('plugin2'),
    options: {}
}], (err) => {

    if (err) {
        throw err;
    }
});
```

### 플러그인 옵션

콜백 전에 `server.register()`에 선택적인 인자를 전달할 수 있습니다. 이 객체에 대한 문서는 [API reference](/api#serverregisterplugins-options-callback)에서 찾을 수 있습니다.

options 객체는 로드될 플러그인에 전달되지 *않고* hapi에서 사용됩니다. 이는 플러그인이 등록된 어떤 경로에 `vhost` 또는 `prefix` 수정자를 적용할 수 있을 뿐 아니라 하나 이상의 레이블 기반으로 서버를 미리 선택하는 것을 가능하게 합니다.

예를 들면 다음과 같은 플러그인이 있다고 가정합니다.:

```javascript
'use strict';

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/test',
        handler: function (request, reply) {
            reply('test passed');
        }
    });

    next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
```

보통 이 플러그인이 로드되면 `/test`에 `GET` 경로가 생성됩니다. options에 `prefix`를 사용하면 플러그인에서 생성한 모든 경로에 문자열이 추가는 것으로 변경됩니다.

```javascript
server.register({ register: require('myplugin') }, {
    routes: {
        prefix: '/plugins'
    }
}, (err) => {

    if (err) {
        throw err;
    }
});
```

이제 플러그인이 로드될 때 `prefix` 옵션 때문에 `/plugins/test`에 `GET` 경로가 만들어질 것입니다.  

비슷하게 `config.vhost` 인자는 플러그인이 로드될 때 생성된 경로의 기본 `vhost`를 설정합니다. `vhost` 설정에 대한 자세한 내용은 [API reference](/api#route-options)에서 찾을 수 있습니다.

`select` 인자는 `server.select()`와 정확히 같은 방식으로 동작합니다. 하나의 레이블 또는 레이블의 배열과 관련된 연결을 플러그인에 전달합니다. 

```javascript
server.register({ register: require('myplugin') }, {
    select: ['webserver', 'admin']
}, (err) => {

    if (err) {
        throw err;
    }
});
```

이렇게 하면 플러그인 코드 수정 없이 서버의 특정 연결에 플러그인을 연결할 수 있습니다.