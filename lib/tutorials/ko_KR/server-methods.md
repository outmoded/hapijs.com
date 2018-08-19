## Server methods

_이 튜터리얼은 hapi v17과 호환됩니다._

서버 메소드는 필요한 곳에서 공통 모듈을 요구하지 않고 서버 객체에 함수를 첨부하여 공유하는 유용한 방법입니다. 서버 메소드를 등록하려면 [`server.method()`](https://hapijs.com/api#server.method())를 호출합니다. 이 함수를 호출하는 두 가지 다른 방법이 있습니다. `server.method(name, method, [options])` 형식으로 호출할 수 있습니다. 예를 들면:

```javascript
const add = function (x, y) {

    return x + y;
};

server.method('add', add, {});
```

또는 `server.method(method)` 형식으로 호출할 수 있습니다. `method`는 `name`, `method`, `options` 인자를 가지는 객체입니다.(이 객체의 배열을 전달할 수 도 있습니다.)

```javascript
const add = function (x, y) {

    return x + y;
};

server.method({
    name: 'add',
    method: add,
    options: {}
});
```

### Name

`name` 인자는 이 후에 서버에서 `server.methods[name]`을 통해 메소드를 찾을 때 사용되는 문자열입니다. `.` 문자로 `name`을 지정하면 문자열 그대로가 아닌 중첩된 객체로 등록됩니다. 마찬가지로:

```javascript
server.method('math.add', add);
```

이 서버 메소드는 `server.methods.math.add()`로 호출 가능하게 됩니다.

### Function

`method` 인자는 메소드가 호출될 때 불리는 실제로 함수입니다. 여러개의 인자를 가질 수 있습니다. `async` 함수일 수 있습니다. 예를 들어:

```js
const add = async function (x, y) {

    const result = await someLongRunningFunction(x, y);
    return result;
};

server.method('add', add, {});
```

서버 메소드 함수는 유효한 결과를 반환하거나 에러가 발생하면 에러를 던져야 합니다.

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

`ttl` flag 설정으로 호출마다 서버 메소드 결과의 `ttl`(time-to-live) 값을 덮어 쓸 수 있습니다. 앞의 예제에서 어떻게 동작하는지 보겠습니다. 

```js
const add = async function (x, y, flags) {

    const result = await someLongRunningFunction(x, y);

    flags.ttl = 5 * 60 * 1000; // 5 mins

    return result;
};

server.method('add', add, {
    cache: {
        expiresIn: 2000,
        generateTimeout: 100
    }
});

server.methods.add(5, 12);
```

여기에서는 기대한 것보다 추가 인자를 하나 더 가지고 있는 서버 메소드 함수를 정의했습니다. 추가적인 `flags` 인자는 hapi에 전달됩니다. (밀리 초 단위로) 결과가 캐싱되기는 원하는 시간으로 `ttl` flag를 간단하게 설정합니다. 만약 `0`으로 설정되면 그 값은 캐싱되지 않습니다. 설정하지 않으면 캐시 설정에서 `ttl` 값을 가지고 옵니다.

### 사용자 키 생성하기

위의 옵션 외에도 메소드에 전달된 인자를 기반으로 키를 생성하는데 사용되는 사용자 함수를 전달할 수 있습니다. 메소드가 단지 문자열 숫자, 논리값의 조합 만 받는다면 hapi가 정상적인 키를 생성할 수 있습니다. 그러나 메소드가 객체 인자를 받는다면 다음처럼 키를 생성하는 함수를 지정해야 합니다.

```javascript
const sum = function (array) {

    let total = 0;

    array.forEach((item) => {

        total += item;
    });

    return total;
};

server.method('sum', sum, {
    generateKey: (array) => array.join(',')
});
```

메소드에 전달된 인자는 generateKey 메소드에서는 사용 가능합니다.

### Bind

서버 메소드에서 사용가능한 마지막 옵션은 `bind`입니다. `bind` 옵션은 메소드 안에서 `this` 값을 변경합니다. 메소드가 추가될 때 현재 활성 컨텍스트를 기본 설정됩니다. 이는 사용자 `generateKey` 함수에서 필요한 데이터베이스 클라이언트를 인자로 전달하지 않고 데이터베이스 클라이언트를 다음처럼 전달할 때 유용합니다.:  

```javascript
const lookup = async function (id) {

    // calls myDB.getOne

    return await this.getOne({ id });
};

server.method('lookup', lookup, { bind: myDB });
```
