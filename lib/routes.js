'use strict';

const Joi = require('joi');
const Boom = require('boom');
const Community = require('./community');
const Resources = require('./resources');
const Path = require('path');
const Plugins = require('./plugins');
const Tutorials = require('./tutorials');


exports.routes = [];


exports.routes.push({
    method: 'GET',
    path: '/',
    config: {
        pre: [
            [
                { method: 'npm.version()', assign: 'version' },
                { method: 'npm.downloads()', assign: 'downloads' },
                { method: 'github.issues()', assign: 'issues' },
                { method: 'github.commits()', assign: 'commits' },
                { method: 'community.frontPage()', assign: 'frontPage' }
            ],
            { method: 'github.latestUpdate', assign: 'latestUpdate' }
        ],
        handler: function (request, reply) {

            return reply.view('index', request.pre);
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/hapidays',
    config: {
        handler: {
            view: 'hapidays'
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/updates',
    config: {
        pre: [
            [
                { method: 'github.issues()', assign: 'issues' },
                { method: 'github.pullRequests()', assign: 'pullRequests' },
                { method: 'github.commits()', assign: 'commits' },
                { method: 'changelog.milestones()', assign: 'milestones' }
            ],
            { method: 'changelog.build', assign: 'changelog' }
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


exports.routes.push({
    method: 'GET',
    path: '/tutorials/{tutorial?}',
    config: {
        handler: function (request, reply) {

            const language = request.query.lang;
            let tutorial;
            
            if (request.params.tutorial) {
                if (Tutorials[request.query.lang][request.params.tutorial]) {
                    tutorial = Tutorials[request.query.lang][request.params.tutorial];
                }
                else {
                    return reply(Boom.notFound());
                }
            }
            else {
                tutorial = Tutorials[request.query.lang].default;
            }

            request.server.methods.markdown.parse(tutorial.contents, (err, html) => {

                if (err) {
                    return reply(Boom.internal(err));
                }

                const context = {
                    languages: Tutorials.languages,
                    language: request.query.lang,
                    tutorials: Tutorials[request.query.lang].all,
                    active: tutorial.title,
                    html: html
                };

                return reply.view('tutorial', context);
            });
        },
        validate: {
          query: {
            lang: Joi
              .string()
              .only(Tutorials.languages)
              .default('en_US')
          }
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/api/index.html',
    config: {
        handler: function (request, reply) {

            return reply.redirect('/api');
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/api/v{tag}',
    config: {
        handler: function (request, reply) {

            return reply.redirect('/api/' + request.params.tag);
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/api/{tag?}',
    config: {
        pre: [[
            { method: 'npm.version()', assign: 'latest' },
            { method: 'npm.versions()', assign: 'versions' }
        ]],
        handler: function (request, reply) {

            const current = request.params.tag || request.pre.latest;
            request.server.methods.github.reference(current, (err, ref) => {

                if (err) {
                    return reply(err);
                }

                return reply.view('api', { html: ref, versions: request.pre.versions, tag: current });
            });
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/community',
    config: {
        handler: function (request, reply) {

            return reply.view('community', { community: Community });
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/plugins',
    config: {
        handler: function (request, reply) {

            return reply.view('plugins', { plugins: Plugins });
        }
    }
});


exports.routes.push({
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

            return reply.view('contribute', request.pre);
        }
    }
});


exports.routes.push({
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


exports.routes.push({
    method: 'GET',
    path: '/styleguide',
    config: {
        pre: [
            { method: 'github.styleGuide()', assign: 'styleGuide' }
        ],
        handler: function (request, reply) {

            return reply.view('document', {
                title: 'hapi.js style guide',
                document: request.pre.styleGuide
            });
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/operating',
    config: {
        pre: [
            { method: 'github.guidelines()', assign: 'guidelines' }
        ],
        handler: function (request, reply) {

            return reply.view('document', {
                title: 'hapi.js operating guidelines',
                document: request.pre.guidelines
            });
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/resources',
    config: {
        handler: function (request, reply) {

            return reply.view('resources', { resources: Resources });
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/help',
    config: {
        handler: {
            view: 'help'
        }
    }
});


exports.routes.push({
    method: 'GET',
    path: '/favicon.ico',
    config: {
        handler: {
            file: 'public/img/favicon.png'
        }
    }
});


exports.routes.push({
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
