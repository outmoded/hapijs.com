var Config = require('getconfig');
var Path = require('path');
var Hapi = require('hapi');

var server = new Hapi.Server(Config.host, Config.port);

server.views({
    engines: {
        jade: require('jade')
    },
    path: Path.join(__dirname, 'templates')
});

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {

        reply('home');
    }
});

server.pack.register({
    plugin: require('good')
}, function (err) {

    if (err) {
        throw err;
    }

    server.start(function () {

        server.log('info', 'Static output preview running at: ' + server.info.uri);
    });
});
