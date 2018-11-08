## 유효성 검사

데이터 검증은 응용프로그램이 안정적이고 안전한지 확인하는데 유용할 수 있습니다. hapi는 `joi` 모듈을 사용하여 이 기능을 제공합니다.

기본으로 모든 가능한 유효성 검사기는 유효성 검사를 하지 않는 `true`로 설정되어 있습니다.

만약 유효성 검사 인자가 `false`로 설정되어 있다면 그 인자에 어떤 값도 허락되지 않음을 의미합니다.

`function (value, options, next)` 모양의 함수를 전달할 수도 있습니다. `value`는 유효성 검사를 할 데이터고, `options`는 서버 객체에 정의된 유효성 검사 옵션입니다. 그리고 `next`는 유효성 검사가 완료되면 호출되는 콜백(`function (err, value)` 모양) 메소드입니다.

유효성 검사 인자의 마지막 가능한 설정은 [Joi](https://github.com/hapijs/joi) 객체이며 간단하고 명확한 객체 문법으로 유효성 검사를 만들 수 있습니다.

## 입력

hapi가 실행하는 첫 번째 유형의 유효성 검사는 입력 유효성 검사입니다. 이는 route 안에 `options` 객체에 정의되어 있으며 헤더, 경로 인자, 질의 인자, 페이로드 데이터의 유효성을 검사할 수 있습니다.

예제를 보겠습니다.:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{name}',
    handler: function (request, reply) {
        reply('Hello ' + request.params.name + '!');
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
    "message": "the length of name must be at least 3 characters long",
    "statusCode": 400,
    "validation": {
        "keys": [
            "name"
        ],
        "source": "params"
    }
}
```

마찬가지로 `/hello/thisnameiswaytoolong`에 요청하면 HTTP `400` 응답을 다음처럼 받을 것입니다.:

```json
{
    "error": "Bad Request",
    "message": "the length of name must be less than or equal to 10 characters long",
    "statusCode": 400,
    "validation": {
        "keys": [
            "name"
        ],
        "source": "params"
    }
}
```

### 질의 인자

질의 인자의 유효성을 검사하려면 route 설정에 `validate.query` 인자를 지정하면 유사한 효과가 나타날 것입니다. 기본으로 hapi는 아무 유효성 검사를 하지 않습니다. 하나의 질의 인자에 대한 유효성 검사를 지정하면 받아들일 수 있는 모든 질의 인자들에 대한 유효성 검사기를 *반드시* 지정해야 합니다.

예를 들면 자원을 나열하는 route를 가지고 있고 사용자가 결과의 개수를 제한하려는 경우 다음 설정을 사용할 수 있습니다.:

```javascript
server.route({
    method: 'GET',
    path: '/list',
    handler: function (request, reply) {
        reply(resources.slice(0, request.query.limit));
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

```json
{
    "error": "Bad Request",
    "message": "the key offset is not allowed",
    "statusCode": 400,
    "validation": {
        "keys": [
            "offset"
        ],
        "source": "query"
    }
}
```

에러에서 보는 것처럼 `offset` 인자는 허용되지 않습니다. `limit` 인자의 유효성 검사를 제공했지만 `offset`에 대한 유효성 검사기를 제공하지 않았기 때문입니다. 만약 하나의 키를 검증한다면 기본으로 모든 키의 유효성을 검증해야 합니다.

### 헤더

`validate.headers` 인자로 들어오는 헤더를 검사할 수 있습니다.

### 페이로드 인자

사용자가 route로 보낸 페이로드 데이터의 유효성을 검사하는 `validate.payload` 인자도 유효합니다. 하나의 키의 유효성을 검사하려면 모든 키의 유효성을 검사해야 하는 점에서 질의 인자 검사와 정확히 같은 방법으로 동작합니다.

## 출력

클라이언트로 응답을 보내기 전에 hapi 응답의 유효성을 검사할 수 있습니다. 이 유효성 검사는 route 객체의 `response` 속성에 정의되어 있습니다.

응답이 응답 유효성 검사를 통과하지 못하면 클라이언트는 기본으로 내부 서버 에러 (500) 응답을 받을 것입니다. (아래의 `response.failAction`을 보세요.)

출력 유효성 검사는 API가 문서/계약과 일치하는 데이터를 제공하는지 확인하는 데 유용합니다. 게다가 [hapi-swagger](https://github.com/glennjones/hapi-swagger) 와 [lout](https://github.com/hapijs/lout) 같은 플러그인은 응답 유효성 검사 스키마를 사용하여 자동으로 각 단말의 출력 형식으로 문서를 만들고 그 문서를 항상 최신 상태로 유지합니다.

hapi는 출력 유효성 검사를 세밀하게 조정할 수 있는 몇 가지 옵션을 제공합니다. 여기 그중에 몇 가지가 있습니다.

### response.failAction

`response.failAction`을 다음 중 하나로 설정하여 응답 유효성 검사가 실패할 때 수행할 작업을 선택할 수 있습니다.
* `error`: 내부 서버 에러 (500) 응답을 전송합니다. (기본)
* `log`: 공격을 기록하고 그대로 응답을 전송합니다.

### response.sample

성능이 중요하다면 hapi는 응답의 일정 비율만 유효성 검사를 하도록 설정할 수 있습니다. route `options`의 `response.sample` 속성으로 이를 설정할 수 있습니다.

### response.status

때때로 하나의 단말이 여러 응답 객체를 제공할 수 있습니다. 예를 들어 `POST` route는 다음 중 하나를 반환할 수 있습니다.:
* 새로운 자원이 생성되었다면 새로 생성된 자원과 함께 `201`
* 기존에 있던 자원이 갱신된 경우 이전 값과 새 값을 함께 `202`

hapi는 각 응답 코드에 대해 다른 유효성 검사를 지정하는 것을 제공합니다. `response.status`는 숫자 상태 코드인 키와 joi 스키마인 속성을 가진 객체입니다.:

```
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

유효성 검사중에 joi에 전달할 옵션입니다. 자세한 내용은 API 문서를 봐주세요.

### 예제

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
    options: {
        handler: function (request, reply) {

            getBooks((err, books) => {

                if (err) {
                    return reply(err);
                }

                return reply(books);
            });
        },
        response: {
            sample: 50,
            schema: Joi.array().items(bookSchema)
        }
    }
});

```

응답의 반만 유효성을 검사합니다. (`sample: 50`) `response.failAction`이 설정되지 않았기 때문에 `books`가 `bookSchema`에 정확히 일치하지 않으면 hapi는 `500` 에러 코드를 응답할 것입니다. 에러 응답은 에러의 이유를 표지하지 *않습니다*. 로깅이 설정되어 있으면 응답 유효성 검사가 실패 원인의 정보를 에러 로그에서 확인할 수 있습니다. `response.failAction`이 `log`로 설정되었다면 hapi는 원래 페이로드로 응답을 하고 유효성 검사 에러를 기록할 것입니다.
