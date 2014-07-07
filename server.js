var Path = require('path');
var Hapi = require('hapi');
var server = new Hapi.Server(3000);
var Watcher = require('./lib/watcher');

server.route({
    method: 'GET',
    path: '/{any*}',
    handler: {
        directory: {
            path: Path.join(__dirname, 'output'),
            index: true,
            defaultExtension: 'html'
        }
    }
});

server.pack.require({ good: null }, function (err) {

    if (err) {
        throw err;
    }

    server.start(function () {

        server.log('info', 'Static output preview running at: ' + server.info.uri);
        Watcher.watch();
    });
});

// suppress error when using "make watch"
process.on('SIGINT', function () {

    process.exit(0);
});
