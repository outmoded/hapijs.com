# Cookies

_This tutorial is compatible with hapi v17_

- [Overview](#overview)
- [Configuring the Server](#server)
    - [server.state()](#server.state)
    - [route.options.state()](#options.state)
- [Setting a Cookie](#setting)
    - [h.state()](#h.state)
- [Overriding Options](#override)
- [Getting a Cookie Value](#value)
- [Clearing a Cookie](#clearing)


## <a name="overview" /> Overview

When writing a web application, cookies are often used to keep state about a user between requests. With hapi, cookies are flexible, secure, and simple to use.  

## <a name="server" /> Configuring the server

hapi has several configurable options when dealing with cookies. The defaults are probably good for most cases, but can be changed when needed. To prepare a cookie, you first need to name it and configure a list of options. You do this by calling `server.state(name, [options])`.

### <a name="server.state" /> server.state()

To use a cookie, you first need to configure it by calling [`server.state(name, [options])`](/api#-serverstatename-options) where `name` is the name of the cookie, and `options` is an object used to configure the cookie.

Please note that the default settings for `options` is good for most cases and don't need to be configured. For learning purposes, you will configure them in this tutorial:

```javascript
server.state('data', {
    ttl: null,
    isSecure: true,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: true,
    strictHeader: true
});
```
In the example above, you first name the cookie `data`. You then configure the options to customize the cookie.

The first option is `ttl`. This represents the cookies time to live in milliseconds. The default setting is `null`, which will delete the cookie once the browser is closed.

Next we have two flags, `isSecure` and `isHttpOnly`. For more info on these flags, see ([RFC 6265](http://tools.ietf.org/html/rfc6265), specifically sections [4.1.2.5](http://tools.ietf.org/html/rfc6265#section-4.1.2.5) and [4.1.2.6](http://tools.ietf.org/html/rfc6265#section-4.1.2.6).

You then tell hapi that the value is a base64 encoded JSON string.

By setting `clearInvalid` to `true`, it instructs the client to remove invalid cookies.

Last, you set `strictHeader` to `true` so that there are no violations of [RFC 6265](https://tools.ietf.org/html/rfc6265).

### <a name="options.state" /> route.options.state()

In addition to this, you can further configure cookie behavior at a route-level by specifying two properties at the route's `options.state` object.

Please note that configurations to cookies on the route-level are in addition to those configurations made by `server.state`.

```json5
{
    options: {
        state: {
            parse: true,
            failAction: 'error'
        }
    }
}
```
The `parse` option determines if cookies are parsed and stored in `request.state`.

The `failAction` options determines how cookie parsing errors will be handled.

## <a name="setting" /> Setting a cookie

Setting a cookie is done via the [response toolkit](/api#response-toolkit) in a request handler, pre-requisite, or request lifecycle extension point.

### <a name="h.state" /> h.state()

You set a cookie by calling [`h.state(name, value, [options]`](https://hapijs.com/api#h.state()). In the following example, you set a cookie in a route handler:

```javascript
server.route({
    method: 'GET',
    path: '/',
    handler: function (request, h) {

        h.state('data', { firstVisit: false });
        return h.response('Hello');
    }
});
```
In this example, you use the cookie we configured in the section above. Here, hapi will reply with the string `Hello` as well as set a cookie named `data` to a base64 encoded JSON string representation of `{ firstVisit: false }`.

The `state()` method is also available on the [response object](/api#response-object) which allows for convenient chaining. The above example can therefore also be written:

```javascript
return h.response('Hello').state('data', { firstVisit: false });
```

## <a name="override" /> Overriding options

When setting a cookie, you may also pass the same options available to `server.state()` as a third parameter, such as:

```javascript
return h.response('Hello').state('data', 'test', { encoding: 'none' });
```

In this example the cookie will simply be set to the string `"test"` with no encoding.

## <a name="value" /> Getting a cookie value

Access a cookie’s value via `request.state` in a route handler, pre-requisite, or request lifecycle extension point.

The `request.state` object contains the parsed HTTP state. Each key represents the cookie name and its value is the defined content.

The sample code uses the `data` cookie key from above where the related value is set to `{ firstVisit: false }`:

```javascript
const value = request.state.data;
// console.log(value) will give you { firstVisit : false }
```

## <a name="clear" /> Clearing a cookie

The cookie can be cleared by calling the `unstate()` method on the [response toolkit](/api#response-toolkit) or [response object](/api#response-object):

```javascript
return h.response('Bye').unstate('data');
```
Here, you just pass the name of the cookie into `unstate()` to clear the cookie.

