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
        options: {
            handler: {
                view: 'hapidays'
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/updates',
        options: {
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
        options: {
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

                const menus = Tutorials[language].all;
                const firstItem = 'getting-started';
                const item = menus.find(({ slug }) => slug === firstItem);
                // add getting started on first position men
                const all = [item].concat(menus.filter(({ slug }) => slug !== firstItem));
                const html = await request.server.methods.markdown.parse(tutorial.contents);
                const context = {
                    languages: Tutorials.languages,
                    language,
                    tutorials: all,
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
        options: {
            handler: function (request, reply) {

                return reply.redirect('/api');
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/api/v{tag}',
        options: {
            handler: function (request, reply) {

                return reply.redirect('/api/' + request.params.tag);
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/api/{tag?}',
        options: {
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
        options: {
            handler: (request, reply) => reply.view('community', { community: Community })
        }
    });


    routes.push({
        method: 'GET',
        path: '/plugins',
        options: {
            handler: (request, reply) => reply.view('plugins', { plugins: Plugins })
        }
    });


    routes.push({
        method: 'GET',
        path: '/contribute',
        options: {
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
        options: {
            pre: [
                { method: server.methods.github.governance, assign: 'governance' }
            ],
            handler: (request, reply) => reply.view('document', { title: 'hapi.js community governance', document: request.pre.governance })
        }
    });


    routes.push({
        method: 'GET',
        path: '/styleguide',
        options: {
            pre: [
                { method: server.methods.github.styleGuide, assign: 'styleGuide' }
            ],
            handler: (request, reply) => reply.view('document', { title: 'hapi.js style guide', document: request.pre.styleGuide })
        }
    });


    routes.push({
        method: 'GET',
        path: '/operating',
        options: {
            pre: [
                { method: server.methods.github.guidelines, assign: 'guidelines' }
            ],
            handler: (request, reply) => reply.view('document', { title: 'hapi.js operating guidelines', document: request.pre.guidelines })
        }
    });


    routes.push({
        method: 'GET',
        path: '/resources',
        options: {
            handler: (request, reply) => reply.view('resources', { resources: Resources })
        }
    });


    routes.push({
        method: 'GET',
        path: '/help',
        options: {
            handler: {
                view: 'help'
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/favicon.ico',
        options: {
            handler: {
                file: 'public/img/favicon.png'
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/public/{path*}',
        options: {
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
