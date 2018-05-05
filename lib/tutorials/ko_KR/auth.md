## 인증

_이 튜터리얼은 hapi v11.x.x와 호환됩니다._

hapi에서 인증은 `schemes`와 `strategies` 개념을 기반으로 하고 있습니다.

"basic", "digest" 같은 인증의 일반적인 유형으로 scheme을 생각하면 됩니다. 반면에 strategy는 미리 설정하고 이름을 붙인 scheme의 인스턴스입니다.

우선 [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic)을 사용하는 예를 보겠습니다.:

```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');
const Basic = require('hapi-auth-basic');

const server = new Hapi.Server();
server.connection({ port: 3000 });

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = function (request, username, password, callback) {
    const user = users[username];
    if (!user) {
        return callback(null, false);
    }

    Bcrypt.compare(password, user.password, (err, isValid) => {
        callback(err, isValid, { id: user.id, name: user.name });
    });
};

server.register(Basic, (err) => {

    if (err) {
        throw err;
    }

    server.auth.strategy('simple', 'basic', { validateFunc: validate });
    server.route({
        method: 'GET',
        path: '/',
        config: {
            auth: 'simple',
            handler: function (request, reply) {
                reply('hello, ' + request.auth.credentials.name);
            }
        }
    });

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('server running at: ' + server.info.uri);
    });
});
```

먼저 이 예제에서 간단한 객체인 `users`라는 데이터베이스를 정의했습니다. 그런 다음 [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic)의 고유한 기능인 검증 함수를 정의하고 사용자가 유효한 자격 증명을 제공했는지 검증할 수 있습니다.

다음으로 플러그인을 등록하면 `basic` 이름을 가진 scheme을 생성합니다. 플러그인 안에서 [server.auth.scheme()](/api#serverauthschemename-scheme)을 통해 이뤄집니다.

플러그인이 등록되면 `basic`이라는 scheme을 참조하는 `simple` 이름의 strategy를 생성하기 위해 [server.auth.strategy()](/api#serverauthstrategyname-scheme-mode-options)를 사용합니다. scheme에 전달되고 행동을 설정할 수 있는 옵션 객체를 전달합니다.

마지막으로 route에 인증에 사용할 strategy 이름인 `simple`을 알려줍니다.

## Schemes

`scheme`은 `function (server, options)` 형태의 메소드 입니다. `server` 인자는 scheme이 추가될 서버를 참조하고 `options` 인자는 이 scheme을 사용하는 strategy가 등록될 때 제공되는 설정 객체입니다.

이 메소드는 *최소한* `authenticate` 키를 가진 객체를 반환해야 합니다. 사용될 수 있는 다른 선택적인 메소드는 `payload`와 `response`입니다.

### `authenticate`

`authenticate` 메소드는 `function (request, reply)` 모양을 가지고 scheme에서 유일한 *필수* 메소드입니다. 

`request`는 서버에서 생성된 `request` 객체입니다. route 처리기에서 사용 가능한 것과 같은 객체이고 [API reference](/api#request-object)에 문서로 만들어 져 있습니다.  

`reply`는 `err`와 `result` 인자를 받는 표준 hapi `reply` 인터페이스입니다.

`err`가 null value가 아니면 인증 실패를 의미하고 사용자에 대한 응답으로 에러가 사용될 것입니다. 에러를 생성하고 적절한 상태 코드와 메시지를 쉽게 제공하려면 [boom](https://github.com/hapijs/boom)을 사용하는 것이 좋습니다.  

`err`가 제공되는 경우 모든 키와 객체 자체가 선택적일지라도 `result` 인자는 객체이어야 합니다.

실패 시 더 자세한 정보를 제공하려면 `result` 객체는 인증된 사용자(또는 인증을 시도했던 자격 증명)`credentials` 속성을 가지고 있어야 하고 `reply(error, null, result);` 처럼 호출되어야 합니다.

인증이 성공하면 `credentials` 속성을 가지고 있는 result 인자로 `reply.continue(result)`를 호출해야 합니다.

또한, 사용자 자격증명의 일부가 아닌 인증 관련 데이터를 포함한 `artifacts` 키를 가질 수 있습니다.

`credentials`와 `artifacts` 속성은 이후에(예를 들면 route 처리기에서) `request.auth` 객체의 부분으로 접근할 수 있습니다.

### `payload`

`payload` 메소드는 `function (request, reply)` 형태로 되어 있습니다.

다시 표준 hapi `reply` 인터페이스가 여기에 있습니다. 에러 때문에 실패를 알리려면 `reply(error, result)` 또는 간단히 `reply(error)`를 호출합니다. (다시 [boom](https://github.com/hapijs/boom) 사용을 추천합니다.)

성공적인 인증을 알리려면 아무 인자 없이 `reply.continue()`를 호출합니다.

### `response`

`response` 메소드는 `function (request, reply)` 형태를 가지며 표준 `reply` 인터페이스를 사용합니다.

이 메소드는 응답을 사용자에게 보내기 전에 응답 객체 (`request.response`)를 추가적인 헤더를 덧붙이기 위한 것입니다.

덧붙임이 완료되면 `reply.continue()`를 호출하고 응답을 전송합니다.

만약 에러가 발생하면 `reply(error)`를 대신 호출합니다. `error`는 [boom](https://github.com/hapijs/boom)을 권장합니다. 

### 등록하기

scheme을 등록하려면 `server.auth.scheme(name, scheme)`을 사용해야 합니다. `name` 인자는 이 특정 scheme을 식별하는 문자열이고, `scheme` 인자는 위에 설명한 메소드입니다. 

## Strategies

scheme을 등록했으면 scheme을 사용해야 합니다. 이때 strategy가 들어옵니다.

앞서 언급했듯이 strategy는 본래 미리 설정된 scheme의 사본입니다.

strategy를 등록하려면 먼저 등록된 scheme이 있어야 합니다. scheme 등록이 완료되었으면 strategy를 등록하기 위해 `server.auth.strategy(name, scheme, [mode], [options])`를 사용합니다.    

`name` 인자는 문자열이어야 하고 이후에 특정 strategy를 식별하기 위해 사용됩니다. `scheme` 또한 문자열이고 strategy로 인스턴스가 되는 scheme의 이름입니다.

### Mode

`mode`는 `true`, `false`, `'required'`, `'optional'`, `'try'` 중 하나일 수 있는 첫 번째 선택적 인자입니다.

기본 mode 값은 `false`입니다. strategy를 등록하지만 직접 수행하기 전까지 아무 곳에도 적용되지 않습니다.

`true`또는 `'required'`로 설정되면 strategy는 자동으로 `auth` 설정이 없는 모든 route에 할당됩니다. 이 설정은 route에 접근하려면 사용자는 인증받고 유효해야 함을 의미합니다. 그렇지 않으면 에러를 받을 것을 의미합니다. 

`'optional'`로 설정되면 strategy는 `auth` 설정이 없는 모든 route에 적용되지만, 사용자는 인증할 필요가 *없습니다*. 인증 데이터는 선택이지만 제공된 경우는 유효해야 합니다.

마지막 모드 설정은 `'try'`이며 `auth` 설정이 없는 모든 route에 적용됩니다. `'try'`와 `'optional'`의 차이는 `'try'`는 유효하지 않은 인증도 허락하고 사용자는 route 처리기에 도달합니다. 

### Options

마지막 선택 인자는 명명한 scheme에 직접 전달되는 `options`입니다.

### 기본 strategy 설정하기

앞서 언급했듯이 `mode` 인자는 `server.auth.strategy()`와 함께 사용되어 기본 strategy를 설정할 수 있습니다. `server.auth.default()`를 사용함으로 기본 strategy를 명시적으로 설정할 수도 있습니다.

이 메소드는 기본값으로 사용할 strategy 이름 문자열 또는 route 처리기의 [auth options](#route-configuration)과 같은 형식의 객체를 하나의 인자를 받습니다.

`server.auth.default()`호출 되기 *전에* 추가된 route에는 기본이 적용되지 않습니다. 모든 route에 기본 strategy가 적용되었는지 확실히 하려면 route를 추가하기 전에 `server.auth.default()`를 호출하거나 strategy를 등록할 때 기본 mode로 설정합니다.

## Route 설정

`config.auth` 인자로 route의 인증을 설정할 수 있습니다. `false`로 설정되면 route에 인증이 사용되지 않습니다. 

사용할 strategy의 이름을 가진 문자열 또는 `mode`, `strategies`, `payload` 인자를 가진 객체로 설정될 수 있습니다.

`mode` 인자는 `'required'`, `'optional'` 또는 `'try'`로 설정될 수 있으며 strategy를 등록할 때와 같이 동작합니다.

하나의 strategy를 지정할 때 strategy 이름의 문자열로 `strategy` 속성을 설정할 수 있습니다. 하나 이상의 strategy를 지정한다면 인자 이름은 `strategies`가 돼야 하고 시도할 각 strategy의 이름 문자열의 배열이어야 합니다. strategy는 성공할 때 까지 하나씩 시도되거나 모두 실패합니다. 

마지막으로 `payload` 인자는 payload는 인증되지 않음을 가리키는 `false`, *반드시* 인증돼야 하는 `'required'` 또는 `true`, 클라이언트가 payload 인증 정보를 포함한다면 반드시 유효해야 하는 `'optional'`로 설정될 수 있습니다.

`payload` 인자는 scheme에서 `payload` 메소드를 지원하는 strategy에서만 사용 가능합니다. 
