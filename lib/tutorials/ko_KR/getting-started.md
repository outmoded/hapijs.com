## hapi 설치

_이 튜터리얼은 hapi v11.x.x와 호환됩니다._

`myproject`라는 디렉터리를 만들어주세요, 그리고 거기서:

* 실행: `npm init` 입력 후, 지시 메시지를 따르세요. package.json을 생성할 것입니다.
* 실행: `npm install --save hapi` 이 명령은 hapi를 설치하고 프로젝트 의존성으로 package.json에 기록합니다.

그게 전부입니다! hapi를 사용한 서버를 만드는 데 필요한 모든 것을 갖췄습니다.

## 서버 만들기

가장 간단한 서버는 다음과 같습니다.:

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
```

먼저 hapi가 필요합니다. 그런 다음 새로운 hapi 서버 객체를 만듭니다. 그다음에 서버에 연결을 추가하고 사용할 포트 번호를 전달합니다. 그리고 서버를 시작하고 서버가 실행 중이라는 로그를 남깁니다

서버에 연결을 추가할 때, hostname, IP 주소 또는 Unix socket 파일, 서버에서 사용할 Windows named pipe을 제공할 수 있습니다. 자세한 정보는 [the API reference](/api/#serverconnectionoptions)를 봐주세요. 

## 경로(routes) 추가하기

하나 또는 두 개의 경로를 추가해야 실제로 동작하는 서버를 지금 가지고 있습니다. 어떻게 생겼는지 보겠습니다:

```javascript
'use strict';

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
```

`server.js`로 저장하고 `node server.js` 명령으로 서버를 시작하세요. 이제 브라우저에서 http://localhost:3000을 방문하면, `Hello, world!`가 표시되고 http://localhost:3000/stimpy를 방문하면 `Hello, stimpy!` 표시됩니다. 

콘텐츠 주입 공격(content injection attacks)을 막기 위해 이름 인자를 URI 인코딩합니다. 출력 인코딩 없이 사용자가 제공한 데이터를 보여주는 것은 절대로 좋은 생각이 아닙니다.  

`method` 인자는 유효한 HTTP 메서드(method), HTTP 메서드 배열 또는 모든 메서드를 허용하는 별표(*)가 될 수 있습니다. `path` 인자는 인자를 포함하는 경로를 정의합니다. 인자는 선택적 인자, 번호 인자, 별표(*)를 포함할 수 있습니다. 자세한 내용은 [the routing tutorial](/tutorials/routing) 봐주세요.

## 정적 페이지와 콘텐츠 만들기

Hello World 응용프로그램으로 간단한 Hapi 앱을 실행할 수 있음을 확인했습니다. 다음은 정적 페이지를 제공하는 **inert**라는 플러그인을 사용할 것입니다. 시작하기 전에 **CTRL + C**로 서버를 중지하세요.

inert를 설치하려면 명령행에서 이 명령을 실행하세요.: `npm install --save inert` inert를 내려받고 설치된 패키지를 문서로 만든 `package.json`에 추가합니다.

`server.js` 파일에 다음을 추가하세요.:

``` javascript
server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/hello',
        handler: function (request, reply) {
            reply.file('./public/hello.html');
        }
    });
});


```

위에서 `server.register()` 명령은 inert 플러그인을 Hapi 응용프로그램에 추가합니다. 만약 문제가 발생하고, 그 원인을 알기 위해 `err`를 받고 그 에러를 던지는 익명함수를 전달했습니다. 이 콜백 함수는 플러그인을 등록할 때 필요합니다.

`server.route`() 명령은 서버가 `/hello`에 대한 GET 요청을 받아들이고 `hello.html` 파일의 내용으로 응답하는 `/hello` 경로를 등록합니다. 정적 페이지를 보여주는 inert를 사용하기 _전에_ inert를 등록해야 하므로 inert를 등록하는 라우팅 콜백 함수 안에 두었습니다. 코드가 실행될 때 플러그인이 존재하는 것을 절대적으로 확신할 수 있도록 플러그인을 등록하는 콜백 안에서 플러그인에 의존 코드를 실행하는 것이 일반적입니다.  

`npm start`로 서버를 시작하고 브라우저에서 `http://localhost:3000/hello`로 이동하세요. 오 이런! `hello.html` 파일을 만들지 않았기 때문에 404 에러를 받았습니다. 이 에러를 제거하기 위해 빠진 파일을 만들어야 합니다 

`hello.html` 파일을 저장할 `public`이라는 폴더를 디렉터리의 루트에 만들어주세요. `hello.html` 안에 다음 HTML을 넣어주세요.: `<h2>Hello World.</h2>`. 그런 다음 브라우저에서 페이지를 다시불러옵니다. "Hello World."라는 머리말이 보일 것입니다.  

Inert는 요청이 있을 때 하드 드라이브에 저장 모든 콘텐츠를 제공합니다. 이는 실시간 다시 읽기 동작을 초래합니다. 취향에 맞춰 `/hello`에 대한 페이지를 바꿔보세요. 

정적 콘텐츠 제공 방법에 대한 자세한 내용은 [Serving Static Content](/tutorials/serving-files)에 자세히 설명되어 있습니다. 이 기술은 웹 응용프로그램에서 이미지, 스타일 시트 그리고 정적 페이지를 제공하는 데 일반적으로 사용됩니다.

## 플러그인 사용하기

웹 응용프로그램을 만들때 일반적인 요구 사항은 접근 로그입니다. 응용프로그램에 기본 로깅을 추가하기 위해 [good](https://github.com/hapijs/good) 플러그인과 [good-console](https://github.com/hapijs/good-console)을 서버에 로드해봅니다. 또한 기본 필터링 구조가 필요합니다. 기본 이벤트 타입과 태그 필터링이 필요하기 때문에 [good-squeeze](https://github.com/hapijs/good-squeeze)를 사용합니다.

시작하기 위해 npm에서 모듈들을 설치합니다.:

```bash
npm install --save good
npm install --save good-console
npm install --save good-squeeze
```

그리고 `server.js`를 수정합니다.:

```javascript
'use strict';

const Hapi = require('hapi');
const Good = require('good');

const server = new Hapi.Server();
server.connection({ port: 3000, host: 'localhost' });

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('Hello, world!');
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '!');
    }
});

server.register({
    register: Good,
    options: {
        reporters: {
            console: [{
                module: 'good-squeeze',
                name: 'Squeeze',
                args: [{
                    response: '*',
                    log: '*'
                }]
            }, {
                module: 'good-console'
            }, 'stdout']
        }
    }
}, (err) => {

    if (err) {
        throw err; // something bad happened loading the plugin
    }

    server.start((err) => {

        if (err) {
            throw err;
        }
        server.log('info', 'Server running at: ' + server.info.uri);
    });
});
```

이제 서버가 시작될 때, 보일 것입니다.:

```
140625/143008.751, [log,info], data: Server running at: http://localhost:3000
```

그리고 브라우저에서 `http://localhost:3000/`을 방문하면 보일 것입니다.:

```
140625/143205.774, [response], http://localhost:3000: get / {} 200 (10ms)
```

대단합니다! 플러그인으로 할 수 있는 짧은 예제 중 하나입니다. 자세한 내용은 [plugins tutorial](/tutorials/plugins) 확인해주세요.

## 그 밖의 모든 것

hapi는 많은 다른 기능들을 가지고 있으며 여기에서는 선택된 몇 가지만 기술했습니다. 많은 기능들을 확인하려면 오른쪽 목록을 사용해주세요. 다른 모든 것은 [API reference](/api)에 문서화 되어 있으며 언제나처럼 자유롭게 질문을 하거나 [#hapi](http://webchat.freenode.net/?channels=hapi)의 freenode에 방문해주세요.
