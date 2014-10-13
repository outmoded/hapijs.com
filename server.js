var Config = require('getconfig');
var Path = require('path');
var Hapi = require('hapi');

var server = new Hapi.Server(Config.host, Config.port);

server.views({
    engines: {
        jade: require('jade')
    },
    path: Path.join(__dirname, 'templates'),
    isCached: Config.getconfig.env === 'production'
});

server.pack.register([
    require('good'),
    require('./lib/npm'),
    require('./lib/github'),
    require('./lib/community'),
    require('./lib/plugins'),
    require('./lib/stylus'),
    require('./lib/uglify'),
    require('./lib/routes')
], function (err) {

    if (err) {
        throw err;
    }

    server.start(function () {

        server.log('info', 'Static output preview running at: ' + server.info.uri);
    });
});
