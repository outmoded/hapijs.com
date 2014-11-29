var Config = require('getconfig');
var Crypto = require('crypto');
var Hapi = require('hapi');
var Jade = require('jade');
var Markdown = require('./lib/markdown');
var Path = require('path');

var server = new Hapi.Server();

Jade.filters.markdown = Markdown.parseSync;

server.connection({
    host: Config.host,
    port: Config.port
});

server.views({
    engines: {
        jade: Jade
    },
    path: Path.join(__dirname, 'templates'),
    isCached: Config.getconfig.env === 'production'
});

server.ext('onPreResponse', function (request, reply) {

    if (!request.response.isBoom) {
        return reply.continue();
    }

    reply.view('error', request.response).code(request.response.output.statusCode);
});

server.register([
    require('./lib/npm'),
    require('./lib/github'),
    require('./lib/stylus'),
    require('./lib/uglify'),
    require('./lib/routes')
], function (err) {

    if (err) {
        throw err;
    }

    server.start(function () {

        console.log('hapijs.com running at: ' + server.info.uri);
    });
});
