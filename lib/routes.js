'use strict';

const Boom = require('boom');
const Community = require('./community');
const Resources = require('./resources');
const Path = require('path');
const Plugins = require('./plugins');
const Tutorials = require('./tutorials');

module.exports = (server) => {

    const routes = [];

    routes.push({
        method: 'GET',
        path: '/',
        options: {
            pre: [
                [
                    { method: server.methods.npm.version, assign: 'version' },
                    { method: server.methods.npm.downloads, assign: 'downloads' },
                    { method: server.methods.github.issues, assign: 'issues' },
                    { method: server.methods.github.commits, assign: 'commits' },
                    { method: server.methods.community.frontPage, assign: 'frontPage' }
                ],
                { method: server.methods.github.latestUpdate, assign: 'latestUpdate' }
            ],
            handler: (request, reply) => reply.view('index', request.pre)
        }
    });


    routes.push({
        method: 'GET',
        path: '/hapidays',
        config: {
            handler: {
                view: 'hapidays'
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/updates',
        config: {
            pre: [
                [
                    { method: server.methods.github.issues, assign: 'issues' },
                    { method: server.methods.github.pullRequests, assign: 'pullRequests' },
                    { method: server.methods.github.commits, assign: 'commits' }
                ],
                { method: server.methods.changelog.milestones, assign: 'milestones' },
                { method: server.methods.changelog.build, assign: 'changelog' }
            ],
            handler: function (request, reply) {

                request.pre.limit = request.query.limit || 10;

                const milestones = request.pre.milestones;
                for (let i = 0; i < milestones.length; ++i) {
                    const milestone = milestones[i];
                    const issues = request.pre.changelog[milestone.title];
                    for (let j = 0; j < issues.length; ++j) {
                        const issue = issues[j];
                        for (let k = 0; k < issue.labels.length; ++k) {
                            if (issue.labels[k].name === 'release notes') {
                                milestone.release_notes = issue;
                                break;
                            }
                        }

                        if (milestone.release_notes) {
                            break;
                        }
                    }
                }

                return reply.view('updates', request.pre);
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/tutorials/{tutorial?}',
        config: {
            handler: async function (request, reply) {

                let tutorial;
                let language = request.query.lang;

                if (!Tutorials[language]) {
                    language = 'en_US';
                }

                if (request.params.tutorial) {
                    if (Tutorials[language][request.params.tutorial]) {
                        tutorial = Tutorials[language][request.params.tutorial];
                    }
                    else {
                        return reply(Boom.notFound());
                    }
                }
                else {
                    tutorial = Tutorials[language].default;
                }

                const html = await request.server.methods.markdown.parse(tutorial.contents);

                const context = {
                    languages: Tutorials.languages,
                    language,
                    tutorials: Tutorials[language].all,
                    active: tutorial.title,
                    html
                };

                return reply.view('tutorial', context);
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/api/index.html',
        config: {
            handler: function (request, reply) {

                return reply.redirect('/api');
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/api/v{tag}',
        config: {
            handler: function (request, reply) {

                return reply.redirect('/api/' + request.params.tag);
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/api/{tag?}',
        config: {
            pre: [[
                { method: server.methods.npm.version, assign: 'latest' },
                { method: server.methods.npm.versions, assign: 'versions' }
            ]],
            handler: async function (request, reply) {

                const versions = Object.keys(request.pre.versions.versions).reverse();
                const current = request.params.tag || request.pre.latest.version;
                const ref =  await request.server.methods.github.reference(current);
                return reply.view('api', { html: ref, versions, tag: current });
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/community',
        config: {
            handler: (request, reply) => reply.view('community', { community: Community })
        }
    });


    routes.push({
        method: 'GET',
        path: '/plugins',
        config: {
            handler: (request, reply) => reply.view('plugins', { plugins: Plugins })
        }
    });


    routes.push({
        method: 'GET',
        path: '/contribute',
        config: {
            pre: [
                { method: server.methods.github.repos, assign: 'repos' },
                [
                    { method: server.methods.github.newContributorIssues, assign: 'newContributorIssues' },
                    { method: server.methods.github.helpWantedIssues, assign: 'helpWantedIssues' }
                ]
            ],
            handler: (request, reply) => reply.view('contribute', request.pre)
        }
    });


    routes.push({
        method: 'GET',
        path: '/governance',
        config: {
            pre: [
                { method: server.methods.github.governance, assign: 'governance' }
            ],
            handler: (request, reply) => reply.view('document', { title: 'hapi.js community governance', document: request.pre.governance })
        }
    });


    routes.push({
        method: 'GET',
        path: '/styleguide',
        config: {
            pre: [
                { method: server.methods.github.styleGuide, assign: 'styleGuide' }
            ],
            handler: (request, reply) => reply.view('document', { title: 'hapi.js style guide', document: request.pre.styleGuide })
        }
    });


    routes.push({
        method: 'GET',
        path: '/operating',
        config: {
            pre: [
                { method: server.methods.github.guidelines, assign: 'guidelines' }
            ],
            handler: (request, reply) => reply.view('document', { title: 'hapi.js operating guidelines', document: request.pre.guidelines })
        }
    });


    routes.push({
        method: 'GET',
        path: '/resources',
        config: {
            handler: (request, reply) => reply.view('resources', { resources: Resources })
        }
    });


    routes.push({
        method: 'GET',
        path: '/help',
        config: {
            handler: {
                view: 'help'
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/favicon.ico',
        config: {
            handler: {
                file: 'public/img/favicon.png'
            }
        }
    });


    routes.push({
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
    return routes;
};
