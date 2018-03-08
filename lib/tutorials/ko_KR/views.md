## Views

_이 튜터리얼은 hapi v11.x.x와 호환됩니다._

hapi는 다양한 템플릿 엔진, 부분, 헬퍼 그리고 레이아웃을 읽어 들여 활용하는 기능을 포함하여 템플릿 렌더링을 광범위하게 지원합니다.

## 서버 설정하기

view를 시작하려면 먼저 서버에 최소한 하나의 템플릿 엔진을 설정해야 합니다. `server.views` 메소드를 사용하여 설정합니다.:

```javascript
'use strict';

const Path = require('path');
const Hapi = require('hapi');
const Hoek = require('hoek');

const server = new Hapi.Server();

server.register(require('vision'), (err) => {

    Hoek.assert(!err, err);

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates'
    });
});

```

여기에서 몇 가지 작업을 하고 있습니다.

먼저 플러그인으로 [`vision`](https://github.com/hapijs/vision) 모듈을 읽어들입니다. hapi에 템플릿 렌더링 지원을 추가합니다. [`vision`](https://github.com/hapijs/vision)는 더이상 hapi에 포함되어있지 않기 때문에 설치해야 합니다. 

두 번째 `handlebars` 모듈을 `.html` 확장자를 가진 템플릿을 렌더링을 담당하는 엔진으로 등록합니다.

세 번째 현재 경로의 `templates` 디렉터리에 템플릿이 있음을 서버에게 알립니다. 기본적으로 hapi는 현재 작업 디렉터리에서 템플릿을 찾습니다. 템플맀이 있는 모든 곳에 대해서 경로를 지정할 수 있습니다. 

### View options

hapi에서 view 엔진에 대한 여러가지 옵션이 있습니다. 전체 문서는 [API reference](/api/#server-options)에서 찾을 수 있으나 여기에서 그중 일부를 살펴보겠습니다. 

모든 옵션은 모든 등록된 엔진에 대해 전역적으로 설정할 수 있거나 특정 엔진에 지역적으로 설정할 수 있습니다. 예제:

```javascript
server.views({
    engines: {
        'html': {
            module: require('handlebars'),
            compileMode: 'sync' // engine specific
        }
    },
    compileMode: 'async' // global setting
});
```

#### 엔진

hapi에서 view를 사용하려면 서버에 최소한 하나의 템플릿 엔진을 등록해야 합니다. 템플릿 엔진은 동기적 또는 비동기적일 수 있으며 외부 공개된 `compile` 이름을 가진 객체이어야 합니다.

동기적 엔진을 위한 `compile` 메소드는 `function (template, options)`이며 에러를 던지거나 컴파일된 html을 반환하는 `function (context, option)` 형태의 함수를 반환합니다.

비동기적 템플릿 엔진은 `function (template, options, callback)` 형태의 `compile` 메소드를 가지고 있습니다. 이 메소드는 표준 에러를 첫 인자로 가지는 `callback`을 호출하고 `function(context, options, callback)` 형태의 새로운 메소드를 반환합니다. 반환된 메소드는 역시 에러를 첫 인자로, 컴파일된 html을 두 번째 인자로 가지는 콜백을 호출합니다. 

기본으로 hapi는 템플릿 엔진을 동기로 가정합니다. (즉 `compileMode`가 기본으로 `sync`) 비동기적 엔진을 사용하려면 `complieMode`를 `async`로 설정해야 합니다.

`compileOptions`와 `runtimeOptions` 설정을 통해 `compile` 메소드와 그 메소드가 반환하는 두 곳에서 `options` 인자를 사용합니다. 이 두 옵션의 기본 값은 빈 객체 `{}`입니다.

`compileOptions`는 `compile`에 두 번째 인자로 전달되는 객체이고 `runtimeOptions`는 `compile` 반환하는 메소드에 전달됩니다. 

하나의 템플릿 엔진만 등록되어 있으면 자동으로 기본이 되어 view를 요청할 때 파일 확장자를 생략할 수 있습니다. 그러나 둘 이상의 엔진이 등록되어 있다면 파일 확장자를 붙이거나 가장 자주 사용하는 엔진에 `defaultExtenstion`을 설정해야 합니다. 기본 엔진을 사용하지 않는 view의 경우 여전히 파일 확장자를 지정해야 합니다.

다른 유용한 옵션은 `isCached`입니다. `false`로 설정되면 hapi는 템플릿의 결과를 캐시 하지 않을 것이고 대신에 매 사용 시 파일로부터 템플릿을 읽어 들일것 입니다. 응용프로그램을 개발할 때 템플릿을 사용하는 동안 앱을 다시 시작하지 않아도 되기 때문에 매우 유용할 수 있습니다. 그러나 프로덕션에서는 `isCached`을 기본값인 `true`로 두는 것이 좋습니다.

#### 경로

view는 여러 다른 위치에 파일들을 가질 수 있기 때문에 hapi는 파일들을 찾는 데 도움이 되게 여러 경로를 설정할 수 있습니다. 여기에 옵션이 있습니다.:

- `path`: 기본 템플릿을 포함한 디렉터리
- `partialsPath`: 부분을 담고 있는 디렉터리
- `helpersPath`: 템플릿 헬퍼를 담고 있는 디렉터리
- `layoutPath`: 레이아웃 템플릿을 담고 있는 디렉터리
- `relativeTo`: 다른 경로에 대한 접두어로 사용. 만약 지정되었다면 다른 경로는 이 디렉터리의 상대 경로입니다.

또한 hapi가 경로를 사용하는 방법을 변경하는 두 가지 설정이 있습니다. 기본으로 절대 경로와 `path` 디렉터리의 외부로 이동은 허용되지 않습니다. 이 동작은 `allowAbsolutePaths`와 `allowInsecureAccess`를 true로 설정하여 변경할 수 있습니다. 

예를 들면 다음과 같은 디렉터리 구조로 되어 있다면:

```
templates\
  index.html
  layout\
    layout.html
  helpers\
    getUser.js
    fortune.js
```

설정은 다음과 같을 것입니다.:

```javascript
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './templates',
    layoutPath: './templates/layout',
    helpersPath: './templates/helpers'
});
```

## view 렌더링

view를 렌더링하는데 두 가지 옵션이 있습니다. `reply.view()` 또는 view 처리기를 사용하는 것입니다.

### `reply.view()`

view를 렌더링하는 첫 번째 방법은 `reply.view()`입니다. 이 방법을 사용하는 route는 다음과 같습니다.: 

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.view('index');
    }
});
```

context를 `reply.view()`에 전달하려면 두 번째 인자로 겍체를 전달합니다. 예제입니다.:

```javascript
reply.view('index', { title: 'My home page' });
```

### view 처리기

view를 렌더링하는 두 번째 방법은 hapi의 내장 view 처리기를 사용하는 것입니다. route는 다음과 같습니다.

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: {
        view: 'index'
    }
});
```

view 처리기를 사용할 때 context는 `context` 키로 전달 됩니다. 예제입니다.:

```json5
handler: {
    view: {
        template: 'index',
        context: {
            title: 'My home page'
        }
    }
}
```

### 전역 context

view에 context를 직접 전달하는 방법을 살펴보았지만 모든 템플릿에 *항상* 사용가능한 기본 context가 있다면 어떻할까요? 

가장 간단한 방법은 `server.view()`를 호출할 때 `context` 옵션을 사용하는 것입니다.

```javascript
const defaultContext = {
    title: 'My personal site'
};

server.views({
    engines: {
        'html': {
            module: require('handlebars'),
            compileMode: 'sync' // engine specific
        }
    },
    context: defaultContext
});
```

기본 전역 context는 낮은 우선순위로 전달되는 지역 context와 합쳐지고 view에 적용될 것입니다.

### View helpers

`helpersPath`에 위치한 javascript 모듈은 템플릿에서 사용할 수 있습니다. 이 예제에서 템플릿에서 사용될 때 문자열 배열에서 하나의 원소를 골라서 출력하는 `fortune`이라는 view 헬퍼를 만들 것입니다.

다음 작은 코드는 `helpers` 디렉터리에 `fortune.js` 파일에 저장된 완전한 헬퍼 함수입니다.

```javascript
module.exports = function () {
    const fortunes = [
        'Heisenberg may have slept here...',
        'Wanna buy a duck?',
        'Say no, then negotiate.',
        'Time and tide wait for no man.',
        'To teach is to learn.',
        'Never ask the barber if you need a haircut.',
        'You will forget that you ever knew me.',
        'You will be run over by a beer truck.',
        'Fortune favors the lucky.',
        'Have a nice day!'
    ];
    const x = Math.floor(Math.random() * fortunes.length);
    return fortunes[x];
};
```

이제 view 헬퍼를 템플릿에서 사용할 수 있습니다. 여기에 handlebar를 템플릿 엔진으로 사용하는 `templates/index.html`에서 헬퍼 함수를 보여주는 작은 코드가 있습니다.

```html
<h1>Your fortune</h1>
<p>{{fortune}}</p>
```

이제 서버를 시작하고 브라우저가 템플릿을 (view 헬퍼를 사용한) 사용하는 route에 접근하면 헤더 바로 아래에 무작위로 선택된 행운을 가진 단락을 볼 것입니다.

참고로 여기 템플릿에서 fortune 헬퍼 메소드를 사용하는 완전한 서버 스크립트가 있습니다.

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();

server.connection({
    port: Number(process.argv[2] || 8080),
    host: 'localhost'
});

server.register(require('vision'), (err) => {

    Hoek.assert(!err, err);

    server.views({
        engines: {
            html: require('handlebars')
        },
        relativeTo: __dirname,
        path: 'templates',
        helpersPath: 'helpers'
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.view('index');
        }
    });
});

server.start();
```

### Layouts

hapi는 view 레이아웃에 대한 내장 지원을 가지고 있습니다. 특정 view 엔진에서 제공하는 레이아웃 시스템과 충돌을 일으킬 수 있기 때문에 기본으로 비활성 상태입니다. 단 하나의 레이아웃 시스템 선택을 추천합니다.

내장 레이아웃 시스템을 사용하려면 먼저 view 엔진을 설정합니다.:

```javascript
server.views({
    // ...
    layout: true,
    layoutPath: Path.join(__dirname, 'templates/layout')
});
```

내장 레이아웃을 활성화하고 기본 레이아웃 페이지를 `templates/layout/layout.html`로 정의합니다. (또는 사용 중인 다른 확장)

`layout.html`에서 콘텐츠 영역을 설정합니다.

```html
<html>
  <body>
    {{{content}}}
 </body>
</html>
```

그리고 view는 콘텐츠가 될 것입니다:

```html
<div>Content</div>
```

view를 렌더링할 때 `{{content}}`는 view 콘텐츠로 바뀔 것입니다.

다른 기본 레이아웃을 원한다면 옵션을 전역으로 설정하세요.:

```javascript
server.views({
    // ...
    layout: 'another_default'
});
```

view 별로 다른 레이아웃을 지정할 수도 있습니다.:

```javascript
    reply.view('myview', null, { layout: 'another_layout' });
```
