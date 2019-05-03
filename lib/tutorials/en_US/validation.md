# Validation

_This tutorial is compatible with hapi v17_

- [Overview](#overview)
- [Joi](#joi)
- [Input Validation](#input)
    - [Path Parameters](#pathparams)
    - [Query Parameters](#queryparams)
    - [Payload Parameters](#payloadparams)
    - [Headers](#headers)
- [Output Validation](#output)
    - [response.failAction](#failaction)
    - [response.sample](#sample)
    - [response.status](#status)
    - [response.options](#options)
- [Alternatives to Joi](#alternatives)




## <a name="overview" /> Overview

Validating data can be very helpful in making sure that your application is stable and secure. hapi allows this functionality by using the module [Joi](https://github.com/hapijs/joi), which allows you to create your validations with a simple and clear object syntax.

## <a name="joi" /> Joi

[Joi](https://github.com/hapijs/joi) is an object schema description language and validator for JavaScript objects. Joi allows you to create blueprints or schemas for JavaScript objects to ensure validation of key information. Joi can validate both input and output data. Joi comes bundled with hapi, so to use it, you just have to require the module:

`const Joi = require('@hapi/joi');`

## <a name="input" /> Input Validation

The first type of validation hapi can perform is input validation. This is defined in the `options` object on a route, and is able to validate headers, path parameters, query parameters, and payload data. Note: In the below examples, you'll see that we give a JS object to `route.options.validate`. Be aware that the `validate` option accepts either JS or `joi` objects for its properties. The latter allows you to set `joi` options for that particular schema. Here is a partial rewrite of the [Query Parameters](#queryparams) example:

```js
options: {
    validate: {
        query: Joi.object({
            limit: Joi.number().integer().min(1).max(100).default(10)
        }).options({ stripUnknown: true });
    }
}
```
Look [here](https://github.com/hapijs/joi/blob/v14.3.1/API.md#anyoptionsoptions) for details about such options.

### <a name="pathparams" /> Path parameters

The first input type that `joi` can validate is path parameters. Consider the following:

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

As you can see here, you've passed a `validate.params` option to the `options` object, this is how you tell hapi that the named parameter specified in the path should be validated. Joi's syntax is very simple and clear to read, the validator you passed here makes sure that the parameter is a string with a minimum length of 3 and a maximum length of 10.

With this configuration, if you make a request to `/hello/jennifer` you will get the expected `Hello jennifer!` reply, however if you make a request to `/hello/a` you will get an HTTP `400` response that looks like the following:

```json
{
    "error": "Bad Request",
    "message": "Invalid request params input",
    "statusCode": 400
}
```

Likewise, if you were to make a request to `/hello/thisnameiswaytoolong`, you'd also get the same error.

### <a name="queryparams" /> Query parameters

To validate query parameters, you simply specify a `validate.query` option in the route's options, and you will get similar effects. By default hapi will not validate anything. If you specify a validator for even one query parameter, that means you *must* specify a validator for all possible query parameters that you would like to accept.

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

This makes sure that the `limit` query parameter is always an integer between 1 and 100, and if unspecified defaults to 10. However, if you make a request to `/posts?limit=15&offset=15` you get another HTTP `400` response and error.

You get an error because the `offset` parameter is not allowed. That's because you didn't provide a validator for it, but you did provide one for the `limit` parameter.

### <a name="payloadparams" /> Payload parameters

Also valid is the `validate.payload` option, which will validate payload data sent to a route by the user. It works exactly the same way as query parameters, in that if you validate one key, you must validate them all. Here is an example: 

```js
server.route({
    method: 'POST',
    path: '/post',
    handler: function (request, h) {

        return 'Blog post added';
    },
    options: {
        validate: {
            payload: {
                post: Joi.string().min(1).max(140),
                date: Joi.date().required()
            }
        }
    }
});
```
The above example is a very basic route that handles an incoming blog post. The user submits the blog post and date in the `request.payload` object. Typically, this would then be stored to a database.  Before that can happen though, we must validate the payload. First, `joi` states that `post` must be a minimum of 1 character, and a maximum of 140 characters. It also states that `date` must be a valid date in the MM-DD-YYYY format and is required. 

If any of payload fails validation, the following error will be thrown:

```json
{
    "error": "Bad Request",
    "message": "Invalid request payload input",
    "statusCode": 400
}
```

### <a name="headers" /> Headers

You may validate incoming headers as well, with a `validate.headers` option. For example: 

```js
server.route({
    method: 'GET',
    path:'/hello/{name}',
    handler: (request, h) => {

       return  `Hello ${request.params.name}!`;
    },
    options: {
        validate: {
            headers: {
                cookie: Joi.string().required()
            },
            options: {
                allowUnknown: true
            }
        }
    }
});
```
Here, you are validating the cookie header as a string and making sure it is required. The `allowUnknown` option allows other incoming headers to be accepted without being validated.   

## <a name="output" /> Output

hapi can also validate responses before they are sent back to the client. This validation is defined in the `response` property of the route `options` object.

If a response does not pass the response validation, the client will receive an Internal Server Error (500) response by default (see `response.failAction` below).

Output validation is useful for ensuring that your API is serving data that is consistent with its documentation/contract. Additionally, plugins like [hapi-swagger](https://github.com/glennjones/hapi-swagger) and [lout](https://github.com/hapijs/lout) can use the response-validation schemas to automatically document each endpoint's output format, thus ensuring that your documentation is always up to date.

hapi supports quite a few options to fine-tune output validation. Here are a few of them:

### <a name="failaction" /> response.failAction

You can choose what to do when response validation fails by setting `response.failAction` to one of the following:
* `error`: send an Internal Server Error (500) response (default)
* `log`: just log the offense and send the response as-is
* `ignore`: take no action and continue processing the request
* A lifecycle method with signature `async function(request, h, err)` where `request` is the request object, `h` is the response toolkit and `err` is the validation error.

For example: 

```js
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
            schema: Joi.array().items(bookSchema),
            failAction: 'log'
        }
    }
});
```
This is a route that will return a list of books. We can see that since `failAction` is set to `log`, the server will just log the error and send the response as-is.  

### <a name="sample" /> response.sample

If performance is a concern, hapi can be configured to validate only a percentage of response. This can be achieved with the `response.sample` property of the route `options`. It should be set to a number between `0`-`100`, representing the percentage of responses that should be validated. Consider the following:

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
Looking at your book route again, you can see, the `sample` value is set to `50`. This means the server will validate one half of the responses.

### <a name="status" /> response.status

Sometimes one endpoint can serve different response objects. For instance, a `POST` route may return one of the following:
* `201` with the newly created resource if a new resource is created.
* `202` with the old and new values if an existing resource was updated.

hapi supports this by allowing you to specify a different validation schema for each response status code. `response.status` is an object with keys that are numeric status codes, and properties that are joi schemas:

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

### <a name="options" /> response.options

Options to pass to joi during validation. Useful to set global options such as `stripUnknown` or `abortEarly` (the complete list is available [here](https://github.com/hapijs/joi/blob/master/API.md#validatevalue-schema-options-callback)). If a custom validation function is defined via `schema` or `status` then `options` can an arbitrary object that will be passed to this function as the second argument.

## <a name="alternatives" /> Alternatives to Joi

We suggest using Joi for your validation, however each of the validation options hapi provides also accepts a few different options.

Most simply, you can specify a boolean for any of the options. By default, all available validators are set to `true` which means that no validation will be performed.

If the validation parameter is set to `false` it signifies that no value is allowed for that parameter.

You may also pass a custom function with the signature `async function (value, options)` where `value` is the data to be validated and `options` is the validation options as defined on the server object. If a value is returned, the value will replace the original object being validated. For example, if you're validating `request.headers`, the returned value will replace `request.headers` and the original value is stored in `request.orig.headers`. Otherwise, the headers are left unchanged. If an error is thrown, the error is handled according to `failAction`.