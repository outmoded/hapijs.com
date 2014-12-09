var Config = require('getconfig');
var Crypto = require('crypto');
var Hapi = require('hapi');
var Jade = require('jade');
var Markdown = require('./lib/markdown');
var Path = require('path');

var serverConfig = {};
if (Config.getconfig.env === 'production') {
    serverConfig.cache = require('catbox-redis');
}
var server = new Hapi.Server(serverConfig);

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

server.method(require('./lib/npm').methods);
server.method(require('./lib/github').methods);
server.method(require('./lib/markdown').methods);

server.route(require('./lib/routes').routes);

var start = function (err) {

    if (err) {
        throw err;
    }

    server.start(function () {

        console.log('hapijs.com running at: ' + server.info.uri);
    });
};

if (Config.getconfig.env === 'dev') {
    server.register(require('building-static-server'), start);
}
else {
    start();
}
