# Validation
## Validation

Validating data can be very helpful in making sure that your application is stable and secure. hapi allows this functionality by using the module `joi`.

By default, all available validators are set to `true` which means that no validation will be performed.

If the validation parameter is set to `false` it signifies that no value is allowed for that parameter.

You may also pass a function with the signature `function (value, options, next)` where `value` is the data to be validated, `options` is the validation options as defined on the server object, and `next` is the callback method (with the signature `function (err, value)`) to be called once validation is complete.

The last available setting for the validation parameters, is a [Joi](https://github.com/hapijs/joi) object, which allows you to create your validations with a simple and clear object syntax.

## Input

The first type of validation hapi can perform is input validation. This is defined in the `config` object on a route, and is able to validate headers, path parameters, query parameters, and payload data.

Let's look at an example:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{name}',
    handler: function (request, reply) {
        reply('Hello ' + request.params.name + '!');
    },
    config: {
        validate: {
            params: {
                name: Joi.string().min(3).max(10)
            }
        }
    }
});
```

### Path parameters

As you can see here, we've passed a `validate.params` parameter to the `config` object, this is how we tell hapi that the named parameter specified in the path should be validated. Joi's syntax is very simple and clear to read, the validator we passed here makes sure that the parameter is a string with a minimum length of 3 and a maximum length of 10.

With this configuration, if we make a request to `/hello/jennifer` we will get the expected `Hello jennifer!` reply, however if we make a request to `/hello/a` we will get an HTTP `400` response that looks like the following:

```javascript
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

Likewise, if we were to make a request to `/hello/thisnameiswaytoolong`, we will get an HTTP `400` that looks like this:

```javascript
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

### Query parameters

To validate query parameters, we simply specify a `validate.query` parameter in the route's config, and we will get similar effects. By default hapi will not validate anything. If you specify a validator for even one query parameter, that means you *must* specify a validator for all possible query parameters that you would like to accept.

For example, if you have a route that lists resources and you would like the user to limit their result set by count, you could use the following configuration:

```javascript
server.route({
    method: 'GET',
    path: '/list',
    handler: function (request, reply) {
        reply(resources.slice(0, request.query.limit);
    },
    config: {
        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(100).default(10)
            }
        }
    }
});
```

This makes sure that the `limit` query parameter is always an integer between 1 and 100, and if unspecifed defaults to 10. However, if we make a request to `/list?limit=15&offset=15` we get an HTTP `400` response that looks like this:

```javascript
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

As you can see in the error, the `offset` parameter isn't allowed. That's because we didn't provide a validator for it, but we did provide one for the `limit` parameter. If you validate one key, by default you must validate them all.

### Headers

You may validate incoming headers as well, with a `validate.headers` parameter.

### Payload parameters

Also valid is the `validate.payload` parameter, which will validate payload data sent to a route by the user. It works exactly the same way as query parameters, in that if you validate one key, you must validate them all.

## Output

In addition to validating input, you can also validate output. This allows you to make sure that you're sending valid data with every request, and can be done like the following:

```javascript
server.route({
    method: 'GET',
    path: '/test',
    handler: function (request, reply) {
        reply({ name: 'test', code: 200 });
    },
    config: {
        response: {
            schema: Joi.object({
                name: Joi.string(),
                code: Joi.number().integer()
            })
        }
    }
});
```

Note that response validation is the only validation type that is *not* configured under the `config.validate` parameter.

A request to `/test` will respond with the payload:

```javascript
{
    "code": 200,
    "name": "test"
}
```

If, for some reason, your route replies with data that does not match the validator specified in the schema, the user will receive an HTTP `500` error instead of the invalid data. This is a very useful way to make sure that your code is well behaved and will not respond with data that it shouldn't.
