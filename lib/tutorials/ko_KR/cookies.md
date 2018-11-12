## Cookies

_이 튜터리얼은 hapi v17에 호환됩니다._

웹 응용프로그램을 작성할 때 쿠키는 요청들 사이에서 사용자에 대한 상태를 보관하려고 할 때 종종 사용됩니다. hapi를 사용한다면 쿠키는 유연하며 안전하고 간단합니다.

## 서버 설정하기

hapi는 쿠키를 다룰 때 몇 가지 설정 가능한 옵션을 가지고 있습니다. 대부분의 경우 기본값이 적절한 선택이지만 필요할 때 변경할 수 있습니다.

쿠키를 사용하려면 우선 [`server.state(name, [options])`](/api#-serverstatename-options)를 호출해서 설정해야 합니다. `name`은 쿠키의 이름이고, `options`는 쿠키를 설정하는 데 사용하는 객체입니다.

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

이 외에도 경로의 `options.state` 객체에서 두 속성을 지정하여 경로 수준에서 쿠키의 행동을 설정할 수 있습니다.

```json5
{
    options: {
        state: {
            parse: true,        // parse cookies and store in request.state
            failAction: 'error' // may also be 'ignore' or 'log'
        }
    }
}
```

## 쿠키 설정하기

쿠키 설정은 요청 처리기, 필요조건(pre-requiste) 또는 요청 생애 주기 확장 지점에서 [response toolkit](/api#response-toolkit)를 통해 다음과 같은 모습으로 수행됩니다.

```javascript
h.state('data', { firstVisit: false });
return h.response('Hello');
```

이 예제에서 hapi는 `data`라는 쿠키를 `{ firstVisit: false }`의 base64로 인코딩된 문자열 표현으로 설정하는 것뿐만 아니라 문자열 `Hello`을 응답합니다.

`state()` 메소드는 편리하게 연속 호출이(chaining) [response object](/api#response-object)로도 가능합니다. 앞의 예제는 다음과 같이 작성될 수도 있습니다.:

```javascript
return h.response('Hello').state('data', { firstVisit: false });
```

### 옵션 덮어쓰기

쿠키를 설정할 때 `server.state()` 함수의 3번째 인자로 같은 옵션을 다음처럼 전달할 수도 있습니다.:

```javascript
return h.response('Hello').state('data', 'test', { encoding: 'none' });
```

이 예제에서 쿠키는 인코딩 없이 `"test"` 문자열로 설정될 것입니다.

## 쿠키 값 가져오기

쿠키 설정은 경로 처리기, 필요조건(pre-requiste) 또는 요청 생애 주기 확장 지점에서 `request.state`를 통해 접근가능합니다.

`request.state` 객체는 파싱된 HTTP 상태를 포함하고 있습니다. 각 키는 쿠키의 이름을 나타내고, 그 값은 정의된 내용입니다.

```javascript
const value = request.state.data;
// console.log(value) will give you { firstVisit : false }
```

예제 코드는 `{ firstVisit: false }` 값을 설정한 위 예제의 `data` 쿠키 키를 사용합니다.

## 쿠키 지우기
[response toolkit](/api#response-toolkit) 또는 [response object](/api#response-object)의 `unstate()` 메소드를 호출하는 것으로 쿠키를 지울 수 있습니다.

```javascript
return h.response('Bye').unstate('data');
```

