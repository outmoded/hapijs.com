## Cookies

_This tutorial is compatible with hapi v17_

When writing a web application, cookies are often used to keep state about a user between requests. With hapi, cookies are flexible, secure, and simple to use.

## Configuring the server

hapi has several configurable options when dealing with cookies. The defaults are probably good for most cases, but can be changed when needed.

To use a cookie, first you should configure it by calling [`server.state(name, [options])`](/api#-serverstatename-options) where `name` is the name of the cookie, and `options` is an object used to configure the cookie.

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

This configuration will make it so the cookie named `data` has a session time-life (will be deleted by the browser when closed), is flagged both secure and HTTP only (see [RFC 6265](http://tools.ietf.org/html/rfc6265), specifically sections [4.1.2.5](http://tools.ietf.org/html/rfc6265#section-4.1.2.5) and [4.1.2.6](http://tools.ietf.org/html/rfc6265#section-4.1.2.6) for more details about these flags), and tells hapi that the value is a base64 encoded JSON string. Full documentation for the `server.state()` options can be found in [the API reference](/api#serverstatename-options).

In addition to this, you can further configure cookie behaviour at a route-level by specifying two properties at the route's `options.state` object:

```json5
{
    config: {
        state: {
            parse: true,        // parse cookies and store in request.state
            failAction: 'error' // may also be 'ignore' or 'log'
        }
    }
}
```

## Setting a cookie

Setting a cookie is done via the [response toolkit](/api#response-toolkit) in a request handler, pre-requisite, or request lifecycle extension point and looks like the following:

```javascript
h.state('data', { firstVisit: false });
return h.response('Hello');
```

In this example, hapi will reply with the string `Hello` as well as set a cookie named `data` to a base64 encoded JSON string representation of `{ firstVisit: false }`.

The `state()` method is also available on the [response object](/api#response-object) which allows for convenient chaining. The above example can therefore also be written:

```javascript
return h.response('Hello').state('data', { firstVisit: false });
```

## Getting a cookie value

Access a cookie’s value via `request.state` in a route handler, pre-requisite, or request lifecycle extension point.

The `request.state` object contains the parsed HTTP state. Each key represents the cookie name and its value is the defined content.

```javascript
const value = request.state.data
// console.log(value) will give you { firstVisit : false }
```

The sample code uses the `data` cookie key from above where the related value is set to `{ firstVisit: false }`.

### Overriding options

When setting a cookie, you may also pass the same options available to `server.state()` as a third parameter, such as:

```javascript
return h.response('Hello').state('data', 'test', { encoding: 'none' });
```

In this example the cookie will simply be set to the string `"test"` with no encoding.

## Clearing a cookie
The cookie can be cleared by calling the `unstate()` method on the [response toolkit](/api#response-toolkit) or [response object](/api#response-object):

```javascript
return h.response('Bye').unstate('data');
```

