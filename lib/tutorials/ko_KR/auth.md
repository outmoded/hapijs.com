## 인증

_이 튜터리얼은 hapi v17과 호환됩니다._

hapi에서 인증은 `schemes`와 `strategies` 개념을 기반으로 하고 있습니다.

"basic", "digest" 같은 인증의 일반적인 유형으로 scheme을 생각하면 됩니다. 반면에 strategy는 미리 설정하고 이름을 붙인 scheme의 인스턴스입니다.

우선 [hapi-auth-basic](https://github.com/hapijs/hapi-auth-basic)을 사용하는 예를 보겠습니다.:

```javascript
'use strict';

const Bcrypt = require('bcrypt');
const Hapi = require('hapi');

const users = {
    john: {
        username: 'john',
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',   // 'secret'
        name: 'John Doe',
        id: '2133d32a'
    }
};

const validate = async (request, username, password) => {

    const user = users[username];
    if (!user) {
        return { credentials: null, isValid: false };
    }

    const isValid = await Bcrypt.compare(password, user.password);
    const credentials = { id: user.id, name: user.name };

    return { isValid, credentials };
};

const start = async () => {

    const server = Hapi.server({ port: 4000 });

    await server.register(require('hapi-auth-basic'));

    server.auth.strategy('simple', 'basic', { validate });

    server.route({
        method: 'GET',
        path: '/',
        options: {
            auth: 'simple'
        },
        handler: function (request, h) {

            return 'welcome';
        }
    });

    await server.start();

    console.log('server running at: ' + server.info.uri);
};

start();
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

`h`는 표준 hapi [응답 도구](https://hapijs.com/api#response-toolkit)입니다.

인증이 성공하면 `h.authenticated({ credentials, artifacts })`를 호출하고 반환하여야 합니다. `credentials` 속성은 인증된 사용자를 (또는 사용자가 인증을 시도한 자격 증명) 표현하는 객체입니다. 또한 사용자의 자격 증명에 포함되지 않는 인증 관련 데이터들을 포함하는 `artifacts` 키를 가질 수 있습니다.

`credentials`와 `artfacts` 속성은 뒤에서 (예를 들면 경로 처리기에서) `request.auth` 객체의 부분으로 접근할 수 있습니다.

만약 인증이 실패하면, 에러를 던지거나 인증 에러인 `error` 객체이고 `credentials`와 `artifacts`를 포함하는 선택적인 `data` 객체로 `h.unauthenticated(error, [data])`를 호출하고 반환할 수 있습니다. 전달된 에러의 세부 사항은 행동에 영향을 줄 것입니다. 자세한 내용은 API 문서 [`server.auth.scheme(name, scheme)`](https://hapijs.com/api#-serverauthschemename-scheme)를 참조하세요. 에러에 대해서는 [boom](https://github.com/hapijs/boom)을 사용하는 것을 추천합니다.

### `payload`

`payload` 메소드는 `function (request, h)` 형태로 되어 있습니다.

다시 표준 hapi 응답 도구가 여기에 있습니다. 에러를 던져 실패를 알리기 위해서는 다시 [boom](https://github.com/hapijs/boom)을 사용하는 것을 추천합니다.

인증 성공을 알리려면 `h.continue`를 반환하세요.

### `response`

`response` 메소드 역시 `function (request, h)` 형채로 되어 있으며 표준 응답 도구를 활용합니다.

이 메소드는 응답이 사용자에게 보내지기 전에 추가 헤더로 응답 객체를 (`request.response`) 꾸미기 위한 것입니다. 

한번 꾸미기가 완료되면 `h.continue`를 반환해야 합니다. 그리고 응답이 보내질 것입니다.

만약 에러가 발생하면 [boom](https://github.com/hapijs/boom)으로 권장되는 에러를 대신 던져야 합니다. 

### 등록하기

scheme을 등록하려면 `server.auth.scheme(name, scheme)`을 사용해야 합니다. `name` 인자는 이 특정 scheme을 식별하는 문자열이고, `scheme` 인자는 위에 설명한 메소드입니다. 

## Strategies

scheme을 등록했으면 scheme을 사용해야 합니다. 이때 strategy가 들어옵니다.

앞서 언급했듯이 strategy는 본래 미리 설정된 scheme의 사본입니다.

strategy를 등록하려면 먼저 등록된 scheme이 있어야 합니다. scheme 등록이 완료되었으면 strategy를 등록하기 위해 `server.auth.strategy(name, scheme, [options])`를 사용합니다.    

`name` 인자는 문자열이어야 하고 이후에 특정 strategy를 식별하기 위해 사용됩니다. `scheme` 또한 문자열이고 strategy로 인스턴스가 되는 scheme의 이름입니다.

### Options

마지막 선택 인자는 명명한 scheme에 직접 전달되는 `options`입니다.2

### 기본 strategy 설정

`server.auth.default()`을 사용하여 기본 strategy를 설정할 수 있습니다.

이 메소드는 하나의 인자를 받습니다. 이 인자는 기본으로 사용할 strategy의 이름이거나 경로 처리기의 [auth options](#경로-설정)과 같은 형식의 객체입니다.

`server.auth.default()`가 호출되기 전에 추가된 경로에는 기본 값이 적용되지 않습니다. 모든 경로에 기본 strategy를 적용하려면 경로가 추가되기 전에 `server.auth.default()`를 호출하거나 strategy를 등록할 때 기본으로 설정해야 합니다.

## 경로 설정

`options.auth` 인자로 경로에서 인증을 설정할 수 있습니다. 만약 `false`로 설정되어 있다면 그 경로에서 인증은 비활성화 됩니다.

사용할 strategy의 이름의 문자열 또는 `mode`, `strategies`, `payload` 인자가 있는 객체로 설정할 수 있습니다. 

`mode` 인자는 `'required'`, `'optional'` 또는 `'try'`로 설정할 수 있습니다. 그리고 strategy를 등록할 때와 동일하게 동작합니다.

`'required'`로 설정하면 경로에 접근하기 위해선 사용자는 인증되어야 합니다. 인증이 유효하지 않다면 에러를 받을 것입니다. 
`mode`가 `'optional'`로 설정되면 strategy는 여전히 경로에 적용될 것입니다. 그러나 이 경우 사용자가 인증 받을 필요는 *없습니다*. 인증 데이터는 선택적입니다. 제공된다면 유효해야 합니다.

마지막 `mode` 설정은 `'try'`입니다. `'try'`와 `'optional'`의 차이점은 `'try'`에서 유효하지 않은 인증도 받아들여지고 사용자는 경로 처리기에 도달할 것입니다.


하나의 strategy를 지정할 때 strategy 이름의 문자열로 `strategy` 속성을 설정할 수 있습니다. 하나 이상의 strategy를 지정한다면 인자 이름은 `strategies`가 돼야 하고 시도할 각 strategy의 이름 문자열의 배열이어야 합니다. strategy는 성공할 때 까지 하나씩 시도되거나 모두 실패합니다. 

마지막으로 `payload` 인자는 payload는 인증되지 않음을 가리키는 `false`, *반드시* 인증돼야 하는 `'required'` 또는 `true`, 클라이언트가 payload 인증 정보를 포함한다면 반드시 유효해야 하는 `'optional'`로 설정될 수 있습니다.

`payload` 인자는 scheme에서 `payload` 메소드를 지원하는 strategy에서만 사용 가능합니다. 
