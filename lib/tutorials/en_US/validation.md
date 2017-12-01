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

```json
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

```json
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
        reply(resources.slice(0, request.query.limit));
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

```json
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

hapi can also validate responses before they are sent back to the client.
This validation is defined in the `response` property of the route `config` object.

If a response does not pass the response validation, the client will receive an Internal Server Error (500) response by default (see `response.failAction` below).

Output validation is useful for ensuring that your API is serving data that is consistent with its documentation/contract.
Additionally, plugins like [hapi-swagger](https://github.com/glennjones/hapi-swagger) and [lout](https://github.com/hapijs/lout) can use the response-validation schemas to automatically document each
endpoint's output format, thus ensuring that your documentation is always up to date.

hapi supports quite a few options to fine-tune output validation. Here are a few of them:

### response.failAction

You can choose what to do when response validation fails by setting `response.failAction` to one of the following:
* `error`: send an Internal Server Error (500) response (default).
* `log`: just log the offense and send the response as-is.

### response.sample

If performance is a concern, hapi can be configured to validate only a percentage of responses.
This can be acheived with the `response.sample` property of the route `config`.

### response.status

Sometimes one endpoint can serve different response objects.
For instance, a `POST` route may return one of the following:
* `201` with the newly created resource if a new resource is created.
* `202` with the old and new values if an existing resource was updated.

hapi supports this by allowing you to specify a different validation schema for each response status code.
`response.status` is an object with keys that are numeric status codes, and properties that are joi schemas:
```
{
    response: {
        status: {
            201: dataSchema,
            202: Joi.object({ original: dataSchema, updated:  dataSchema })
        }
    }
}
```

### response.options
options to pass to joi during validation. See the API docs for more details.

### Example

Here is an example route configuration that returns a list of books:

```javascript
const bookSchema = Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    isbn: Joi.string().length(10),
    pageCount: Joi.number(),
    datePublished: Joi.date().iso()
});

server.route({
    method: 'GET',
    path: '/books',
    config: {
        handler: function (request, reply) {

            getBooks((err, books) => {

                if (err) {
                    return reply(err);
                }

                return reply(books);
            });
        },
        response: {
            sample: 50,
            schema: Joi.array().items(bookSchema)
        }
    }
});

```

This will validate one half of the responses (`sample: 50`).
Because `response.failAction` is not specified, hapi will respond with a `500` error code if any `books` do not match the `bookSchema` exactly.
The error response will *not* indicate the reason for the error.
If you have logging configured, you will be able to inspect your error logs for information about what caused the response validation to fail.
If `response.failAction` were set to `log`, then hapi would respond with the original payload, and log the validation error.
