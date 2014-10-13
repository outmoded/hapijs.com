var Path = require('path');

exports.register = function (plugin, options, next) {

    plugin.route({
        method: 'GET',
        path: '/',
        config: {
            pre: [
                [
                    { method: 'npm.version', assign: 'version' },
                    { method: 'npm.downloads', assign: 'downloads' },
                    { method: 'github.issues', assign: 'issues' },
                    { method: 'github.commits', assign: 'commits' },
                    { method: 'community', assign: 'community' }
                ],
                { method: 'github.latestUpdate', assign: 'latestUpdate' }
            ],
            handler: function (request, reply) {

                reply.view('index', request.pre)
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/public/{path*}',
        config: {
            handler: {
                directory: {
                    path: Path.join(__dirname, '..', 'public'),
                    index: false,
                    redirectToSlash: false
                }
            }
        }
    });

    next();
};

exports.register.attributes = {
    name: 'routes',
    version: '1.0.0'
};
