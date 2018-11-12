## Validation

_This tutorial is compatible with hapi v17_

Validating data can be very helpful in making sure that your application is stable and secure. hapi allows this functionality by using the module [Joi](https://github.com/hapijs/joi), which allows you to create your validations with a simple and clear object syntax.

## Input

The first type of validation hapi can perform is input validation. This is defined in the `options` object on a route, and is able to validate headers, path parameters, query parameters, and payload data.

Let's look at an example:

```javascript
server.route({
    method: 'GET',
    path: '/hello/{name}',
    handler: function (request, h) {

        return `Hello ${request.params.name}!`;
    },
    options: {
        validate: {
            params: {
                name: Joi.string().min(3).max(10)
            }
        }
    }
});
```

### Path parameters

As you can see here, we've passed a `validate.params` option to the `options` object, this is how we tell hapi that the named parameter specified in the path should be validated. Joi's syntax is very simple and clear to read, the validator we passed here makes sure that the parameter is a string with a minimum length of 3 and a maximum length of 10.

With this configuration, if we make a request to `/hello/jennifer` we will get the expected `Hello jennifer!` reply, however if we make a request to `/hello/a` we will get an HTTP `400` response that looks like the following:

```json
{
    "error": "Bad Request",
    "message": "Invalid request params input",
    "statusCode": 400
}
```

Likewise, if we were to make a request to `/hello/thisnameiswaytoolong`, we'd also get the same error.

### Query parameters

To validate query parameters, we simply specify a `validate.query` option in the route's options, and we will get similar effects. By default hapi will not validate anything. If you specify a validator for even one query parameter, that means you *must* specify a validator for all possible query parameters that you would like to accept.

For example, if you have a route that returns a list of blog posts and you would like the user to limit their result set by count, you could use the following configuration:

```javascript
server.route({
    method: 'GET',
    path: '/posts',
    handler: function (request, h) {

        return posts.slice(0, request.query.limit);
    },
    options: {
        validate: {
            query: {
                limit: Joi.number().integer().min(1).max(100).default(10)
            }
        }
    }
});
```

This makes sure that the `limit` query parameter is always an integer between 1 and 100, and if unspecifed defaults to 10. However, if we make a request to `/posts?limit=15&offset=15` we get another HTTP `400` response and error.

We got an error because the `offset` parameter is not allowed. That's because we didn't provide a validator for it, but we did provide one for the `limit` parameter.

### Headers

You may validate incoming headers as well, with a `validate.headers` option.

### Payload parameters

Also valid is the `validate.payload` option, which will validate payload data sent to a route by the user. It works exactly the same way as query parameters, in that if you validate one key, you must validate them all.

## Output

hapi can also validate responses before they are sent back to the client.
This validation is defined in the `response` property of the route `options` object.

If a response does not pass the response validation, the client will receive an Internal Server Error (500) response by default (see `response.failAction` below).

Output validation is useful for ensuring that your API is serving data that is consistent with its documentation/contract.
Additionally, plugins like [hapi-swagger](https://github.com/glennjones/hapi-swagger) and [lout](https://github.com/hapijs/lout) can use the response-validation schemas to automatically document each
endpoint's output format, thus ensuring that your documentation is always up to date.

hapi supports quite a few options to fine-tune output validation. Here are a few of them:

### response.failAction

You can choose what to do when response validation fails by setting `response.failAction` to one of the following:
* `error`: send an Internal Server Error (500) response (default)
* `log`: just log the offense and send the response as-is
* `ignore`: take no action and continue processing the request
* A lifcycle method with signature `async function(request, h, err)` where `request` is the request object, `h` is the response toolkit and `err` is the validation error

### response.sample

If performance is a concern, hapi can be configured to validate only a percentage of responses
This can be achieved with the `response.sample` property of the route `options`. It should be set to a number between `0`-`100`, representing the percentage of responses that should be validated.

### response.status

Sometimes one endpoint can serve different response objects.
For instance, a `POST` route may return one of the following:
* `201` with the newly created resource if a new resource is created.
* `202` with the old and new values if an existing resource was updated.

hapi supports this by allowing you to specify a different validation schema for each response status code.
`response.status` is an object with keys that are numeric status codes, and properties that are joi schemas:

```json5
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
Options to pass to joi during validation. See the [API docs](/api#-routeoptionsresponseoptions) for more details.

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
    handler: async function (request, h) {

        return await getBooks();
    },
    options: {
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

### Alternatives to Joi

We suggest using Joi for your validation, however each of the validation options hapi provides also accepts a few different options.

Most simply, you can specify a boolean for any of the options. By default, all available validators are set to `true` which means that no validation will be performed.

If the validation parameter is set to `false` it signifies that no value is allowed for that parameter.

You may also pass a custom function with the signature `async function (value, options)` where `value` is the data to be validated and `options` is the validation options as defined on the server object. If a value is returned, the value will replace the original object being validated. For example, if you're validating `request.headers`, the returned value will replace `request.headers` and the original value is stored in `request.orig.headers`. Otherwise, the headers are left unchanged. If an error is thrown, the error is handled according to `failAction`.
