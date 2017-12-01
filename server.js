'use strict';

const Config = require('getconfig');
const Hapi = require('hapi');
const Jade = require('jade');
const Markdown = require('./lib/markdown');
const Path = require('path');

if (Config.server.cache) {
    Config.server.cache.engine = require(Config.server.cache.engine);
}

const server = new Hapi.Server(Config.server);

Jade.filters.markdown = Markdown.parseSync;

server.connection({
    host: Config.host,
    port: Config.port
});

server.ext('onPreResponse', (request, reply) => {

    if (!request.response.isBoom) {
        return reply.continue();
    }

    return reply.view('error', request.response).code(request.response.output.statusCode);
});

server.method(require('./lib/npm').methods);
server.method(require('./lib/github').methods);
server.method(require('./lib/markdown').methods);
server.method(require('./lib/community').methods);
server.method(require('./lib/changelog').methods);

const plugins = [
    {
        register: require('good'),
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

server.register(plugins, (err) => {

    if (err) {
        throw err;
    }

    server.views({
        engines: {
            jade: Jade
        },
        path: Path.join(__dirname, 'templates'),
        isCached: Config.getconfig.env === 'production'
    });

    server.route(require('./lib/routes').routes);

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('hapijs.com running at: ' + server.info.uri);
    });
});
