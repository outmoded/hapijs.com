## 서버 메소드

서버 메소드는 필요한 곳에서 공통 모듈을 요구하지 않고 서버 객체에 함수를 첨부하여 공유하는 유용한 방법입니다. 서버 메소드를 등록하려면 `server` 객체에 접근해야 합니다. 별도의 인자를 전달하는 두 가지 다른 방식이 가능합니다.

```javascript
const add = function (x, y, next) {
    // note that the 'next' callback must be used to return values
    next(null, x + y);
};

server.method('add', add, {});
```

또는 `name`, `method`, `options` 인자를 가지는 객체(이 객체의 배열을 전달할 수 도 있습니다.):

```javascript
const add = function (x, y, next) {
    next(null, x + y);
};

server.method({
    name: 'add',
    method: add,
    options: {}
});
```

## Name

`name` 인자는 이 후에 서버에서 `server.methods[name]`을 통해 메소드를 찾을 때 사용되는 문자열입니다. `.` 문자로 `name`을 지정하면 문자열 그대로가 아닌 중첩된 객체로 등록됩니다. 마찬가지로:

```javascript
server.method('math.add', add);
```

server.methods.math.add로 접근 가능하게 됩니다.

## Function

`method` 인자가 메소드가 불릴 때 호출되는 실제 함수입니다. 여러 개의 인자를 가질 수 있지만 마지막 인자는 callback을 *반드시* 받아야 합니다. 이 callback은 3개의 인자를 받습니다.: `err`, `result` 그리고 `ttl`입니다. 메소드 안에서 에러가 발생하면 에러를 첫 인자로 전달합니다. 에러가 없다면 첫 인자는 undefined 또는 null이고 두 번째 인자에 반환 값이 전달됩니다. `ttl`인자는 hapi에게 반환 값이 얼마 동안 캐시 되는지를 알려줍니다; `0`은 캐시 되지 않음을 나타냅니다.

## Caching

서버 메소드의 다른 주요 장점인 캐시에 대해 말하면 hapi의 기본 캐싱을 사용할 수 있다는 것입니다. 기본은 캐시하지 않는 것이지만 메소드를 등록할 때 유효한 설정이 전달되면 반환 값은 캐시되고 매번 호출될 때마다 재수행 대신 제공합니다. 설정은 다음과 같습니다.:

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

인자의 의미:

* `expiresIn`: 캐시에 항목이 저장된 이후 밀리 초 단위로 표현된 상대적인 만료시간. `expiresAt`과 같이 사용할 수 없습니다.
* `expiresAt`: route의 모든 캐시 레코드가 만료될 'HH:MM' 형식의 24시간 표기법으로 표현된 시간. 지역 시간을 사용합니다. `expiresIn`과 같이 사용할 수 없습니다.
* `staleIn`: 캐시에 저장된 항목을 신선하지 않음을 표시하고 다시 생성하려는 밀리 초 단위 시간. `expiresIn`보다 작아야 합니다.
* `staleTimeout`: generateFunc가 새로운 값을 생성하는 동안 신선하지 않은 값을 반환하기 전에 기다리는 밀리 초 단위 시간.
* `generateTimeout`: 값을 반환하는데 너무 오랜 시간이 걸려 시간 초과 에러를 반환하기 전에 기다리는 밀리 초 단위 시간. 값이 최종적으로 반환되면 이후 요청을 위해 캐시에 저장합니다.
* `segment`: 캐시 항목을 분리하는데 사용되는 선택적 부분 이름입니다.  
* `cache`: 사용할 서버에 설정된 캐시 연결의 이름을 가진 선택적 문자열입니다.

캐싱 옵션에 대한 자세한 정보는 [API Reference](/api#servermethodmethod)와 [catbox](https://github.com/hapijs/catbox#policy)의 문서를 참고해주세요.

## 사용자 키 생성하기

위의 옵션 외에도 메소드에 전달된 인자를 기반으로 키를 생성하는데 사용되는 사용자 함수를 전달할 수 있습니다. 메소드가 단지 문자열 숫자, 논리값을 받는다면 hapi가 정상적인 키를 생성할 수 있습니다. 그러나 메소드가 객체 인자를 받는다면 다음처럼 키를 생성하는 함수를 지정해야 합니다.

```javascript
const sum = function (array, next) {
    let total = 0;

    array.forEach((item) => {
        total += item;
    });

    next(null, total);
};

server.method('sum', sum, {
    generateKey: function (array) {
        return array.join(',');
    }
});
```

메소드에 전달된 인자는 generateKey 메소드에서는 사용가능 하지만 callback에서는 사용할 수 *없습니다*.

## Bind

서버 메소드에서 사용가능한 마지막 옵션은 `bind`입니다. `bind` 옵션은 메소드 안에서 `this` 값을 변경합니다. 메소드가 추가될 때 현재 활성 컨텍스트를 기본 설정됩니다. 이는 사용자 `generateKey` 함수에서 필요한 데이터베이스 클라이언트를 인자로 전달하지 않고 데이터베이스 클라이언트를 다음처럼 전달할 때 유용합니다.:  

```javascript
const lookup = function (id, next) {
    // calls myDB.getOne
    this.getOne({ id: id }, (err, value) => {
        next(err, value);
    });
};

server.method('lookup', lookup, { bind: myDB });
```
