## 정적 파일 제공하기

_이 튜터리얼은 hapi v17과 호환됩니다._

필연적으로 웹 응용프로그램을 만드는 동안 디스크에 있는 단순 파일을 제공해야 합니다. 추가 핸들러의 사용으로 hapi에 이 기능을 추가하는 [inert](https://github.com/hapijs/inert)라는 hapi 플러그인이 있습니다.

먼저 inert 설치와 프로젝트에 의존성을 추가해야 합니다.:

`npm install --save inert`

## `h.file(path, [options])`

먼저 [`h.file()`](https://github.com/hapijs/inert#hfilepath-options) 메소드를 사용하는 방법을 봅니다.:

```javascript
const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('/path/to/picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

위에서 볼 수 있는 것처럼 가장 기본적인 형태로 `h.file(path)`를 반환하는 것입니다.

### 상대 경로

특히 파일로 응답하는 경로가 여러 개가 있다면, 단순하게 만들기 위해 서버 안에 기본 경로를 설정할 수 있고, 단지 상대 경로만 `h.file()`에 전달합니다.

```javascript
'use strict';

const Hapi = require('hapi');
const Path = require('path');

const server = Hapi.server({
    routes: {
        files: {
            relativeTo: Path.join(__dirname, 'public')
        }
    }
});

const start = async () => {

    await server.register(require('inert'));

    server.route({
        method: 'GET',
        path: '/picture.jpg',
        handler: function (request, h) {

            return h.file('picture.jpg');
        }
    });

    await server.start();

    console.log('Server running at:', server.info.uri);
};

start();
```

위와 같이 `server.options.routes` 아래의 옵션을 설정하면 _모든_ 경로에 적용될 것입니다. 경로 수준에서 `relativeTo` 옵션을 포함하여 이 옵션을 설정할 수 있습니다. 

## 파일 핸들러(handler)

위의 경로 대신 `file` 핸들러를 사용할 수 있습니다.:

```javascript
server.route({
    method: 'GET',
    path: '/picture.jpg',
    handler: {
        file: 'picture.jpg'
    }
});
```

### 파일 핸들러 옵션

`request` 객체를 받아 파일의 경로(절대 또는 상대)를 문자열로 넘겨주는 함수를 인자로 지정할 수 있습니다:

```javascript
server.route({
    method: 'GET',
    path: '/{filename}',
    handler: {
        file: function (request) {
            return request.params.filename;
        }
    }
});
```

`path` 속성을 가진 객체일 수도 있습니다. 객체 형식의 핸들러를 사용할 때, `Content-Disposition` 헤더 설정과 압축된 파일을 허용하는 것 같은 몇 가지 추가적인 것을 할 수 있습니다.

```javascript
server.route({
    method: 'GET',
    path: '/script.js',
    handler: {
        file: {
            path: 'script.js',
            filename: 'client.js', // override the filename in the Content-Disposition header
            mode: 'attachment', // specify the Content-Disposition is an attachment
            lookupCompressed: true // allow looking for script.js.gz if the request allows it
        }
    }
});
```

## 디렉터리 핸들러

`file` 핸들러 외에 inert는 여러 파일을 제공하는 하나의 경로를 지정할 수 있는 `directory` 핸들러를 추가했습니다. 이를 사용하려면 인자를 가진 경로를 지정해야 합니다. 그러나 인자의 이름은 중요하지 않습니다. 인자에 별표(*) 확장을 사용하여 파일 깊이도 제약할 수 있습니다. directory 핸들러의 가장 기본적인 사용법은 다음과 같습니다.:

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public'
        }
    }
});
```

### 디렉터리 핸들러 옵션

위의 경로는 `public` 디렉터리 안의 일치하는 파일 이름을 찾아 요청에 응답합니다. 이 설정에서 `/`에 대한 요청은 HTTP `403`으로 응답할 것입니다. index 파일을 추가하여 이를 수정할 수 있습니다. 기본으로 hapi는 `index.html`으로 불리는 파일을 디렉터리에서 찾을 것입니다. index 옵션을 `false`로 설정하여 index 파일을 제공하지 않도록 할 수 있습니다. 또는 inert가 index 파일로 찾을 파일의 배열을 지정할 수 있습니다.
 
```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            index: ['index.html', 'default.html']
        }
    }
});
```

`/`에 대한 요청은 먼저 `/index.html`을 불러오려고 시도할 것이고, 그 다음에는 `/default.html`을 시도할 것입니다. 사용가능한 index 파일이 없다면 inert는 디렉터리의 내용을 목록 페이지로 보여줄 것입니다. 다음과 같이 `listing` 속성을 `true`로 설정하여 활성화 할 수 있습니다.: 

```javascript
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: 'public',
            listing: true
        }
    }
});
```
이제 `/`에 대한 요청은 디렉터리의 내용을 보여주는 HTML로 응답할 것입니다. 목록이 활성화된 directory 핸들러를 사용할 때, 기본으로 숨겨진 파일들은 목록에서 보이지 않습니다. `showHidden` 옵션을 `true`로 설정하는 것으로 변경할 수 있습니다. file 핸들러처럼 directory 핸들러 또한 가능한 경우 미리 압축된 파일을 제공하는 `lookupCompressed` 옵션을 가지고 있습니다. 원래 경로를 찾지 못할 경우 요청에 추가되는 `defaultExtension` 옵션을 설정할 수 있습니다. `/bacon`에 대한 요청은 파일 `/bacon.html`에 대해서도 시도할 것입니다.
