'use strict';

const Config = require('getconfig');
const Hapi = require('hapi');
const Pug = require('pug');
const Markdown = require('./lib/markdown');
const Path = require('path');
const isProd = process.env.NODE_ENV === 'production';

if (Config.server.cache && isProd) {
    Config.server.cache.engine = require(Config.server.cache.engine);
}

const server = Hapi.server(Config.server);

Pug.filters.markdown = Markdown.parseSync;
const start = async function () {

    server.ext({
        type: 'onPreResponse',
        method: function (request, h) {

            if (!request.response.isBoom) {
                return h.continue;
            }
            return h.view('error', request.response).code(request.response.output.statusCode);
        } });

    server.method(require('./lib/npm').methods);
    server.method(require('./lib/github').methods);
    server.method(require('./lib/markdown').methods);
    server.method(require('./lib/changelog').methods);

    const plugins = [
        {
            plugin: require('good'),
            options: {
                ops: {
                    interval: 30 * 1000
                },
                reporters: {
                    console: [{
                        module: 'good-console',
                        args: [{ log: '*', response: '*', log: '*' }]
                    }, 'stdout']
                }
            }
        },
        require('vision'),
        require('inert')
    ];

    if (Config.getconfig.env === 'dev') {
        plugins.push(require('building-static-server'));
    }

    await server.register(plugins);
    server.views({
        engines: {
            pug: Pug
        },
        path: Path.join(__dirname, 'templates'),
        isCached: Config.getconfig.env === 'production'
    });
    server.route(require('./lib/routes')(server));
    try {
        await server.start();
        console.log('hapijs.com running at: ' + server.info.uri);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
};

process.on('unhandledRejection', (reason, p) => {

    console.log('Unhandled Rejection at:', p, 'reason:', reason);
});

start();
