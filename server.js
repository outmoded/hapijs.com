'use strict';

const Config = require('getconfig');
const Hapi = require('hapi');
const Jade = require('jade');
const Markdown = require('./lib/markdown');
const Path = require('path');

const serverConfig = {};

if (Config.getconfig.env === 'production') {
    serverConfig.cache = require('catbox-redis');
}

const server = new Hapi.Server(serverConfig);

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

server.route(require('./lib/routes').routes);

const plugins = [];

plugins.push({
    register: require('good'),
    options: {
        reporters: [{
            reporter: require('good-console'),
            events: {
                log: '*',
                response: '*',
                ops: '*'
            }
        }]
    }
});

if (Config.getconfig.env === 'dev') {
    plugins.push(require('building-static-server'));
}

server.register(plugins, (err) => {

    if (err) {
        throw err;
    }

    server.start((err) => {

        if (err) {
            throw err;
        }

        console.log('hapijs.com running at: ' + server.info.uri);
    });
});
