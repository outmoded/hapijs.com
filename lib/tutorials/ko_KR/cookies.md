## 쿠키

_이 튜터리얼은 hapi v11.x.x와 호환됩니다._

웹 응용프로그램을 작성할 때 쿠키를 사용하는 것이 종종 필요합니다. hapi를 사용한다면 쿠키는 유연하며 안전하고 간단합니다.

## 서버 설정하기

hapi는 쿠키를 다룰 때 몇 가지 설정 가능한 옵션을 가지고 있습니다. 대부분의 경우 기본값이 적절한 선택이지만 필요할 때 변경할 수 있습니다.

설정하려면 `server.state(name, options)` 함수를 호출하세요. `name`은 쿠키의 문자열 이름이고 `options`는 특정 쿠키를 설정하는 데 사용하는 객체입니다.

```javascript
server.state('data', {
    ttl: null,
    isSecure: true,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});
```

이 설정은 세션 수명을(브라우저가 닫힐 때 삭제) 가지고 있고, secure와 HTTP only 두 플래그가 설정되었으며(이 플래그에 대해서 더욱 자세한 정보는 [RFC 6265](http://tools.ietf.org/html/rfc6265), 특히 [4.1.2.5](http://tools.ietf.org/html/rfc6265#section-4.1.2.5) 장과 and [4.1.2.6](http://tools.ietf.org/html/rfc6265#section-4.1.2.6) 장을 봐주세요) hapi에게 값은 base64로 인코딩된 JSON 문자열이라는 것을 알려주는 `data`라는 쿠키를 만듭니다. `server.state()` 옵션 관련 전체 문서는 [the API reference](/api#serverstatename-options)에서 찾을 수 있습니다.

이 외에도 경로를 추가할 때 두 인자를 `options`에 전달 할 수 있습니다.:

```json5
{
    options: {
        state: {
            parse: true, // parse and store in request.state
            failAction: 'error' // may also be 'ignore' or 'log'
        }
    }
}
```

## 쿠키 설정하기

쿠키 설정은 요청 처리기, 필요조건(pre-requiste) 또는 요청 생애 주기 확장 지점에서 [`reply()` 함수](/api#reply-interface)를 통해 다음과 같은 모습으로 수행됩니다.

```javascript
reply('Hello').state('data', { firstVisit: false });
```

이 예제에서 hapi는 `data`라는 쿠키를 주어진 객체의 base64로 인코딩된 문자열 표현으로 설정하는 것뿐만 아니라 문자열 `Hello`을 응답합니다.

### 옵션 덮어쓰기

쿠키를 설정할 때 `server.state()` 함수의 3번째 인자로 같은 옵션을 다음처럼 전달할 수도 있습니다.:

```javascript
reply('Hello').state('data', 'test', { encoding: 'none' });
```

## 쿠키 지우기

[`response`](/api#response-object) 객체의 `unstate()` 메소드를 호출하는 것으로 쿠키를 지울 수 있습니다.

```javascript
reply('Hello').unstate('data');
```

