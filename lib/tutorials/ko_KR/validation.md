## 유효성 검사

_이 튜터리얼은 hapi v17과 호환됩니다._

데이터 검증은 응용프로그램이 안정적이고 안전한지 확인하는데 유용할 수 있습니다. hapi는 간단하고 명확한 객체 문법으로 유효성 검사를 만들수 있는 [Joi](https://github.com/hapijs/joi) 모듈을 사용하여 이 기능을 제공합니다.

## Input

hapi가 실행하는 첫 번째 유형의 유효성 검사는 입력 유효성 검사입니다. 이는 route 안에 `options` 객체에 정의되어 있으며 헤더, 경로 인자, 질의 인자, 페이로드 데이터의 유효성을 검사할 수 있습니다.

예제를 보겠습니다.:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{name}',
    handler: function (request, h) {

        return `Hello ${request.params.name}!`;
    },
    options: {
        validate: {
            params: {
                name: Joi.string().min(3).max(10)
            }
        }
    }
});
```

### 경로 인자

여기에서 볼 수 있듯이 `validate.params` 인자를 `options` 객체에 전달하는 것으로 hapi는 경로에 지정된 명명된 인자의 유효성을 검증해야 합니다. Joi의 문법은 매우 간단하고 읽기에 명확합니다. 유효성 검사기는 인자가 최소 3글자, 최대 10글자인 문자열인지 확인합니다.

이 설정으로 `/hello/jennifer`에 요청하면 `Hello jennifer!`라는 응답을 받을 것입니다. 하지만 `/hello/a`에 요청하면 HTTP `400` 응답을 다음과 같이 받을 것입니다.:

```json
{
    "error": "Bad Request",
    "message": "Invalid request params input",
    "statusCode": 400
}
```

마찬가지로 `/hello/thisnameiswaytoolong`에 요청하면 같은 에러를 받을 것입니다.

### 질의 인자

질의 인자의 유효성을 검사하려면 route 옵션에 `validate.query` 옵션을 지정하면 유사한 효과가 나타날 것입니다. 기본으로 hapi는 아무 유효성 검사를 하지 않습니다. 하나의 질의 인자에 대한 유효성 검사를 지정하면 받아들일 수 있는 모든 질의 인자들에 대한 유효성 검사기를 *반드시* 지정해야 합니다.

예를 들면 블로그 글의 목록을 반환하는 route를 가지고 있고 사용자가 결과의 개수를 제한하려는 경우 다음 설정을 사용할 수 있습니다.:

```javascript
server.route({
    method: 'GET',
    path: '/posts',
    handler: function (request, h) {

        return posts.slice(0, request.query.limit);
    },
    options: {
        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(100).default(10)
            }
        }
    }
});
```

`limit` 질의 인자는 항상 1과 100 사이의 정수인 것을 확인하고, 만약 없다면 기본값으로 10을 설정합니다. `/list?limit=15&offset=15`로 요청하면 HTTP `400` 응답을 다음과 같이 받을 것입니다.   

`offset` 인자가 허락되지 않기때문에 에러를 받았습니다.  `limit` 인자의 유효성 검사를 제공했지만 `offset`에 대한 유효성 검사기를 제공하지 않았기 때문입니다.

### 헤더

`validate.headers` 인자로 들어오는 헤더를 검사할 수 있습니다.

### 페이로드 인자

사용자가 route로 보낸 페이로드 데이터의 유효성을 검사하는 `validate.payload` 인자도 유효합니다. 하나의 키의 유효성을 검사하려면 모든 키의 유효성을 검사해야 하는 점에서 질의 인자 검사와 정확히 같은 방법으로 동작합니다. 

## 출력

클라이언트로 응답을 보내기 전에 hapi 응답의 유효성을 검사할 수 있습니다. 이 유효성 검사는 route `options` 객체의 `response` 속성에 정의되어 있습니다.

응답이 응답 유효성 검사를 통과하지 못하면 클라이언트는 기본으로 내부 서버 에러 (500) 응답을 받을 것입니다. (아래의 `response.failAction`을 보세요.)

출력 유효성 검사는 API가 문서/계약과 일치하는 데이터를 제공하는지 확인하는 데 유용합니다. 게다가 [hapi-swagger](https://github.com/glennjones/hapi-swagger) 와 [lout](https://github.com/hapijs/lout) 같은 플러그인은 응답 유효성 검사 스키마를 사용하여 자동으로 각 단말의 출력 형식으로 문서를 만들고 그 문서를 항상 최신 상태로 유지합니다.

hapi는 출력 유효성 검사를 세밀하게 조정할 수 있는 몇 가지 옵션을 제공합니다. 여기 그중에 몇 가지가 있습니다.

### response.failAction

`response.failAction`을 다음 중 하나로 설정하여 응답 유효성 검사가 실패할 때 수행할 작업을 선택할 수 있습니다.
* `error`: 내부 서버 에러 (500) 응답을 전송합니다. (기본)
* `log`: 공격을 기록하고 그대로 응답을 전송합니다.
* `ignore`: 아무 행동을 하지 않고 요청 처리를 계속 합니다.
* `request`는 요청 객체, `h`는 응답 도구, `err`이 유효성 에러인 async function(request, h, err)` 형식의 라이프사이클 메소드 

### response.sample

성능이 중요하다면 hapi는 응답의 일정 비율만 유효성 검사를 하도록 설정할 수 있습니다. route `config`의 `response.sample` 속성으로 이를 설정할 수 있습니다. 응답이 유효한지의 응답 확률인 `0`-`100` 사이의 숫자로 설정될 것입니다.

### response.status

때때로 하나의 단말이 여러 응답 객체를 제공할 수 있습니다. 예를 들어 `POST` route는 다음 중 하나를 반환할 수 있습니다.:
* 새로운 자원이 생성되었다면 새로 생성된 자원과 함께 `201`
* 기존에 있던 자원이 갱신된 경우 이전 값과 새 값을 함께 `202` 

hapi는 각 응답 코드에 대해 다른 유효성 검사를 지정하는 것을 제공합니다. `response.status`는 숫자 상태 코드인 키와 joi 스키마인 속성을 가진 객체입니다.:

```json5
{
    response: {
        status: {
            201: dataSchema,
            202: Joi.object({ original: dataSchema, updated:  dataSchema })
        }
    }
}
```

### response.options
유효성 검사중에 joi에 전달할 옵션입니다. 자세한 내용은 [API docs](/api#-routeoptionsresponseoptions)를 봐주세요.

### Example

여기에 책 목록을 반환하는 route 설정 예제가 있습니다.:

```javascript
const bookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    isbn: Joi.string().length(10),
    pageCount: Joi.number(),
    datePublished: Joi.date().iso()
});

server.route({
    method: 'GET',
    path: '/books',
    handler: async function (request, h) {

        return await getBooks();
    },
    options: {
        response: {
            sample: 50,
            schema: Joi.array().items(bookSchema)
        }
    }
});

```

응답의 반만 유효성을 검사합니다. (`sample: 50`) `response.failAction`이 설정되지 않았기 때문에 `books`가 `bookSchema`에 정확히 일치하지 않으면 hapi는 `500` 에러 코드를 응답할 것입니다. 에러 응답은 에러의 이유를 표지하지 *않습니다*. 로깅이 설정되어 있으면 응답 유효성 검사가 실패 원인의 정보를 에러 로그에서 확인할 수 있습니다. `response.failAction`이 `log`로 설정되었다면 hapi는 원래 페이로드로 응답을 하고 유효성 검사 에러를 기록할 것입니다.

### Joi의 대안

유효성 검사에 Joi를 사용할 것을 권합니다. 그러나 hapi가 제공하는 유효성 검사 옵션 각각에서 몇 가지 다른 선택을 할 수 있습니다.

가장 단순하게 어떤 옵션에 boolean을 지정할 수 있습니다. 기본으로 모든 사용 가능한 유효성 검사는 `true`로 설정되어 있고 이는 유효성 검사가 수행되지 않음을 의미합니다.

유효성 검증 인자가 `false`로 설정되면, 해당 인자에 값이 허용되지 않음을 나타냅니다.

유효성 검사를 받을 데이터인 `value`와 서버 객체에 정의된 유효성 검사 옵션인 `options`를 인자로 가지는 `async function(value, options)` 형식의 사용자 함수를 전달할 수 있습니다. 만약 값이 반환된다면 값은 유효성 검사를 받은 원본 객체를 대체합니다. 예를 들어 `request.headers`의 유효성을 검사한다면 반환된 값은 `request.headers`를 대체할 것이고 원본 값은 `request.orig.headers`에 저장될 것입니다. 그렇지 않으면 헤더는 변경되지 않습니다. 만약 에러가 발생하면 에러는 `failAction`에 따라 처리됩니다.
