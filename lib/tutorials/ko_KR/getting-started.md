## Getting started

_이 튜터리얼은 hapi v17과 호환됩니다._

### hapi 설치

`myproject`라는 디렉터리를 만들어 주세요. 그리고 거기서:

* 실행: `cd myproject` 생성한 프로젝트 폴더로 이동합니다.
* 실행: `npm init` 입력 후, 지시 메시지를 따르세요. package.json 파일을 생성할 것입니다.
* 실행: `npm install --save hapi@17.x.x` 이 명령은 hapi를 설치하고 프로젝트 의존성을 package.json에 기록합니다.

이게 전부입니다! hapi를 사용하는 서버를 만드는 데 필요한 모든 것을 갖췄습니다.

### 서버 만들기

가장 간단한 서버는 다음과 같습니다.:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

먼저 hapi가 필요합니다. 그런 다음 호스트(host)와 사용할 포트 번호를 포함한 설정 객체로 새로운 hapi 서버 객체를 만듭니다. 그 후에 서버를 시작하고 실행 중이라는 로그를 남깁니다.

서버를 생성할 때 호스트 이름, IP 주소 또는 Unix 소켓 파일, 서버에서 사용할 Windows named pipe도 제공할 수 있습니다. 자세한 정보는 [the API reference](/api/#-server-options)를 봐주세요.

### 경로(routes) 추가하기

하나 또는 두 개의 경로를 추가해야 실제로 동작하는 서버를 가지고 있습니다. 어떻게 생겼는지 보겠습니다.:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        return 'Hello, ' + encodeURIComponent(request.params.name) + '!';
    }
});

const init = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
```

`server.js`로 저장하고 `node server.js` 명령으로 서버를 시작하세요. 이제 브라우저에서 [http://localhost:3000](http://localhost:3000)을 방문하면, `Hello, world!`가 표시되고 [http://localhost:3000/stimpy](http://localhost:3000/stimpy)을 방문하면 `Hello, stimpy!`가 표시됩니다.

콘텐츠 주입 공격(content injection attacks)을 막기 위해 이름 인자를 URI 인코딩 합니다. 출력 인코딩 없이 사용자가 제공한 데이터를 보여주는 것은 절대로 좋은 생각이 아닙니다!

`method` 인자는 유효한 HTTP 메서드(method), HTTP 메서드의 배열 또는 모든 메서드를 허용하는 별표(\*)가 될 수 있습니다. `path` 인자는 인자를 포함하는 경로를 정의합니다. 선택적(optional) 인자, 번호 인자, 별표(\*)를 포함할 수 있습니다. 자세한 내용은 [the routing tutorial](/tutorials/routing)을 봐주세요.

### 정적 페이지와 콘텐츠 만들기

Hello World 응용프로그램으로 간단한 hapi 앱을 실행할 수 있음을 확인했습니다. 다음은 정적 페이지를 제공하는 **inert**라는 플러그인을 사용할 것입니다. 시작하기 전에 **CTRL + C**로 서버를 중지하세요.

[inert](https://github.com/hapijs/inert)를 설치하려면 명령행에서 이 명령을 실행하세요.: `npm install --save inert` [inert](https://github.com/hapijs/inert)를 내려받고 설치된 패키지를 문서로 만든 `package.json`에 추가합니다.

`server.js` 파일에 `init` 함수를 변경합니다.:

``` javascript
const init = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/hello',
        handler: (request, h) => {

            return h.file('./public/hello.html');
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
```

위에서 `server.register()` 명령은 [inert](https://github.com/hapijs/inert) 플러그인을 hapi 응용프로그램에 추가합니다.

`server.route`() 명령은 서버가 `/hello`에 대한 GET 요청을 받아들이고 `hello.html` 파일의 내용으로 응답하는 `/hello` 경로를 등록합니다. `inert` 플러그인을 등록한 후에 경로 등록을 합니다. 플러그인을 등록한 후 플러그인에 의존하는 코드를 실행하면 코드가 실행될 때 플러그인이 있다는 것을 확신할 수 있습니다.

`node server.js`로 서버를 시작하고 브라우저에서 [`http://localhost:3000/hello`](http://localhost:3000/hello)로 이동하세요. 오 이런! `hello.html` 파일을 만들지 않았기 때문에 에러를 받았습니다. 이 에러를 제거하기 위해 빠진 파일을 만들어야 합니다.

`hello.html` 파일을 저장할 `public`이라는 폴더를 디렉터리의 루트에 만들어주세요. `hello.html` 안에 다음 HTML을 넣어주세요.: 

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Hapi.js is awesome!</title>
  </head>
  <body>
    <h1>Hello World.</h1>
  </body>
</html>
```

간단하고 유효한 HTML5 문서입니다.

이제 브라우저에서 페이지를 다시 불러옵니다. "Hello World."라는 머리말이 보일 것입니다.

[Inert](https://github.com/hapijs/inert)는 요청이 있을 때 하드 드라이브에 저장된 모든 콘텐츠를 제공합니다. 이는 실시간 다시 읽기 동작을 초래합니다. 취향에 맞춰 `/hello`에 대한 페이지를 바꿔보세요.

정적 콘첸츠 제공 방법에 대한 자세한 내용은 [Serving Static Content](/tutorials/serving-files)에 자세히 설명되어 있습니다. 이 기술은 웹 응용프로그램에서 이미지, 스타일 시트 그리고 정적 페이지를 제공하는 데 일반적으로 사용됩니다.

### 플러그인 사용하기

웹 응용프로그램을 만들때 일반적인 요구 사항은 접근 로그입니다. 응용프로그램에 기본 로깅을 추가하기 위해 [hapi pino](https://github.com/pinojs/hapi-pino) 플러그인을 로드합니다.

시작하기 위해 npm에서 모듈들을 설치합니다.:

```bash
npm install hapi-pino
```

그리고 `server.js`를 수정합니다.:

```javascript
'use strict';

const Hapi = require('hapi');

const server = Hapi.server({
    port: 3000,
    host: 'localhost'
});

server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {

        return 'Hello, world!';
    }
});

server.route({
    method: 'GET',
    path: '/{name}',
    handler: (request, h) => {

        // request.log(['a', 'name'], "Request name");
        // or
        request.logger.info('In handler %s', request.path);

        return `Hello, ${encodeURIComponent(request.params.name)}!`;
    }
});

const init = async () => {

    await server.register({
        plugin: require('hapi-pino'),
        options: {
            prettyPrint: false,
            logEvents: ['response', 'onPostStart']
        }
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();

```

이제 서버가 시작할 때, 다음과 같은 것을 볼 것입니다.:

```sh
[2017-12-03T17:15:45.114Z] INFO (10412 on box): server started
    created: 1512321345014
    started: 1512321345092
    host: "localhost"
    port: 3000
    protocol: "http"
    id: "box:10412:jar12y2e"
    uri: "http://localhost:3000"
    address: "127.0.0.1"
```

그리고 브라우저에서 [http://localhost:3000/](http://localhost:3000/)을 방문하면 터미널에 요청에 대한 로그가 출력중인 것을 볼 수 있습니다.

등록 함수에 전달되는 `options`로 로거의 행동이 설정됩니다.

대단합니다! 플러그인으로 할 수 있는 짧은 예제 중 하나입니다. 자세한 내용은 [plugins tutorial](/tutorials/plugins)을 확인해주세요.

### 그 밖의 모든 것

hapi는 많은 다른 기능들을 가지고 있으며 여기에서는 선택된 몇가지만 기술했습니다. 많은 기능들을 확인하려면 오른쪽 목록을 사용해주세요. 다른 모든 것은 [API reference](/api)에 문서화 되어 있으며 언제나처럼 [github](https://github.com/hapijs/discuss/issues)과 [gitter](https://gitter.im/hapijs/hapi)에 자유롭게 질문을 하거나 [slack](https://join.slack.com/t/hapihour/shared_invite/enQtNTA5MDUzOTAzOTU4LTUyZmFiYjkyMTBmNDcyMmI2MmRjMzg4Y2YzNTlmNzUzNjViN2U1NmYyY2NjYjhiYWU4MGE2OTFhZDRlYWMyZDY)을 방문해주세요.
