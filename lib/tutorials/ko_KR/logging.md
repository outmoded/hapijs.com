## Logging

_이 튜터리얼은 hapi v17에 호환됩니다._

다른 서버 소프트웨어와 마찬가지로 로깅은 매우 중요합니다. hapi는 이러한 로그를 볼수 있는 기본 기능뿐만 아니라 내장 로깅 메소드를 가지고 있습니다.

### 내장 메소드

거의 동일한 두 가지 로깅 방법인 [`server.log(tags, [data, [timestamp]])`](/api#-serverlogtags-data-timestamp)와 [`request.log(tags, [data])`](https://hapijs.com/api#-requestlogtags-data)가 있습니다. 이 둘은 응용프로그램에서 이벤트를 로깅할 때 호출될 수 있습니다. 경로 처리기(route handler), 요청 생애주기 확장(request lifecycle extension)또는 인증 스킴(authentication scheme)같은 request의 문맥 안에서 `request.log()`를 호출할 것입니다. 예를들어 서버가 시작한 직후 또는 플러그인의 `register()` 메소드 안에서 처럼 특별한 요청이 없는 그 밖에 다른 곳에서는 `server.log()`를 사용할 것입니다. 

둘 모두 처음 2개의 동일한 인자를 받습니다. 순서대로 `tags`, `data`입니다.

`tags`는 이벤트를 바로 식별하는 문자열 또는 문자열의 배열입니다. 로그 레벨 같지만 보다 표현적이라고 생각하세요. 예를 들어 다음과 같이 데이터베이스로부터 데이터를 받는 동안 에러를 태그할 수 있습니다.:

```javascript
server.log(['error', 'database', 'read']);
```

hapi가 내부에서 생성하는 로그 이벤트는 항상 그 이벤트와 연관된 `hapi` 태그를 가지고 있습니다.

두 번째 인자 `data`는 이벤트와 함께 기록할 선택적인 문자열 또는 객체입니다. 이 인자는 에러 메시지 같은 것 또는 태그를 붙이고 싶은 다른 구체적인 것이 저장되는 곳입니다.

추가적으로 `server.log()`는 세번째 `timestamp`인자를 받습니다. 기본 값은 `Date.now()`이고 어떤 이유로 기본 값을 덮어쓸 필요가 있을 경우만 전달합니다.

### 로그 가져오기와 표시하기

hapi 서버 객체는 각 로그 이벤트마다 이벤트를 생성합니다. 표준 EventEmitter API를 사용하여 그 이벤트를 수신하고 원하는 대로 표시할 수 있습니다.


```javascript
server.events.on('log', (event, tags) => {

    if (tags.error) {
        console.log(`Server error: ${event.error ? event.error.message : 'unknown'}`);
    }
});
```

`server.log()`로 로깅된 이벤트는 `log` 이벤트로 생성되고 `request.log()`로 로깅된 이벤트는 `request` 이벤트로 샌성됩니다.

`request.logs`를 통해 특정 요청에 대한 모든 로그들을 가져올 수 있습니다. 이는 로깅된 모든 이벤트들을 포함하고 있는 배열일 것입니다. 먼저 경로 설정에서 `logs.collect` 옵션을 `true`로 설정해야 합니다. 그렇지 않으면 배열은 비어있을 것입니다.

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

### 디버그 모드(개발에서만)

추가적인 플러그인 설정하거나 로깅 코드를 작성없이 로그 이벤트를 콘솔에 출력하는 고통없는 방법인 hapi는 디버그 모드를 가지고 있습니다.

기본적으로 디버그 모드에서 코드에서 잡히지 않은 에러와 hapi API의 잘못 구현으로 인한 실행시간 에러만 콘솔에 출력될 것입니다. 그러나 태그에 기반한 요청 이벤트가 출력되도록 설정할 수 있습니다. 예를들면 요청에서 에러를 출력하려고 한다면 다음처럼 서버를 설정하세요.:

```javascript
const server = Hapi.server({ debug: { request: ['error'] } });
```

디버그 모드에 대한 더 많은 정보는 [API 문서](https://hapijs.com/api#-serveroptionsdebug)에서 찾을 수 있습니다.

## 로깅 플러그인

hapi에서 로그 검색 및 출력을 위햇 제공하는 내장 메소드는 매우 적습니다. 보다 풍부한 로깅 경험을 위해서 [good](https://github.com/hapijs/good) 같은 플러그인 사용법을 실제로 봐야 합니다.