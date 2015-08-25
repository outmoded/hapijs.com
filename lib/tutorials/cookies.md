## Cookies

_This tutorial is compatible with hapi v9.x.x._

When writing a web application, using cookies is often a necessity. When using hapi, cookies are flexible, safe, and simple.

## Configuring the server

hapi has several configurable options when dealing with cookies. The defaults are probably good for most cases, but can be changed when needed.

To configure them, call `server.state(name, options)` where `name` is the string name of the cookie, and `options` is an object used to configure the specific cookie.

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

This configuration will make it so the cookie named `data` has a session time-life (will be deleted when the browser is closed), is flagged both secure and HTTP only (see [RFC 6265](http://tools.ietf.org/html/rfc6265), specifically sections [4.1.2.5](http://tools.ietf.org/html/rfc6265#section-4.1.2.5) and [4.1.2.6](http://tools.ietf.org/html/rfc6265#section-4.1.2.6) for more details about these flags), and tells hapi that the value is a base64 encoded JSON string. Full documentation for the `server.state()` options can be found in [the API reference](/api#serverstatename-options).

In addition to this, you may pass two parameters to the `config` when adding a route:

```json5
{
    config: {
        state: {
            parse: true, // parse and store in request.state
            failAction: 'error' // may also be 'ignore' or 'log'
        }
    }
}
```

## Setting a cookie

Setting a cookie is done via the [`reply()` interface](/api#reply-interface) in a request handler, pre-requisite, or request lifecycle extension point and looks like the following:

```javascript
reply('Hello').state('data', { firstVisit: false });
```

In this example, hapi will reply with the string `Hello` as well as set a cookie named `data` to a base64 encoded string representation of the given object.

### Overriding options

When setting a cookie, you may also pass the same options available to `server.state()` as a third parameter, such as:

```javascript
reply('Hello').state('data', 'test', { encoding: 'none' });
```

