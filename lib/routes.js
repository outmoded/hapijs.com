var Boom = require('boom');
var Community = require('./community');
var Path = require('path');
var Plugins = require('./plugins');
var Tutorials = require('./tutorials');

exports.register = function (plugin, options, next) {

    plugin.route({
        method: 'GET',
        path: '/',
        config: {
            pre: [
                [
                    { method: 'npm.version()', assign: 'version' },
                    { method: 'npm.downloads()', assign: 'downloads' },
                    { method: 'github.issues()', assign: 'issues' },
                    { method: 'github.commits()', assign: 'commits' }
                ],
                { method: 'github.latestUpdate', assign: 'latestUpdate' }
            ],
            handler: function (request, reply) {

                request.pre.community = Community;
                reply.view('index', request.pre);
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/hapidays',
        config: {
            handler: {
                view: 'hapidays'
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/updates',
        config: {
            pre: [
                [
                    { method: 'github.issues()', assign: 'issues' },
                    { method: 'github.pullRequests()', assign: 'pullRequests' },
                    { method: 'github.commits()', assign: 'commits' },
                    { method: 'github.changelog()', assign: 'changelog' }
                ]
            ],
            handler: function (request, reply) {

                reply.view('updates', request.pre);
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/tutorials/{tutorial?}',
        config: {
            handler: function (request, reply) {

                var tutorial = request.params.tutorial || 'getting-started';
                var tutorials = Tutorials.map(function (tutorial) {

                    return tutorial.slug;
                });

                if (tutorials.indexOf(tutorial) === -1) {
                    return reply(Boom.notFound());
                }

                var context = {
                    tutorials: Tutorials,
                    active: tutorial
                };

                reply.view('tutorials/' + tutorial, context);
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/api/{tag?}',
        config: {
            pre: [[
                { method: 'npm.version()', assign: 'latest' },
                { method: 'github.tags()', assign: 'tags' }
            ]],
            handler: function (request, reply) {

                var available = request.pre.tags.map(function (tag) {
                    return tag.name;
                }).sort().reverse();
                var current = request.params.tag || 'v' + request.pre.latest;
                request.server.methods.github.reference(current, function (err, ref) {

                    reply.view('api', { html: ref, tags: available, tag: current });
                });
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/community',
        config: {
            handler: function (request, reply) {

                reply.view('community', { community: Community });
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/plugins',
        config: {
            handler: function (request, reply) {

                reply.view('plugins', { plugins: Plugins });
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/contribute',
        config: {
            pre: [
                { method: 'github.repos()', assign: 'repos' },
                [
                    { method: 'github.newContributorIssues', assign: 'newContributorIssues' },
                    { method: 'github.helpWantedIssues', assign: 'helpWantedIssues' }
                ]
            ],
            handler: function (request, reply) {

                reply.view('contribute', request.pre);
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/governance',
        config: {
            pre: [
                { method: 'github.governance()', assign: 'governance' }
            ],
            handler: function (request, reply) {

                reply.view('document', {
                    title: 'hapi.js community governance',
                    document: request.pre.governance
                });
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/styleguide',
        config: {
            pre: [
                { method: 'github.styleGuide()', assign: 'styleGuide' }
            ],
            handler: function (request, reply) {

                reply.view('document', {
                    title: 'hapi.js style guide',
                    document: request.pre.styleGuide
                });
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/operating',
        config: {
            pre: [
                { method: 'github.guidelines()', assign: 'guidelines' }
            ],
            handler: function (request, reply) {

                reply.view('document', {
                    title: 'hapi.js operating guidelines',
                    document: request.pre.guidelines
                });
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/help',
        config: {
            handler: {
                view: 'help'
            }
        }
    });

    plugin.route({
        method: 'GET',
        path: '/favicon.ico',
        config: {
            handler: {
                file: 'public/img/favicon.png'
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
