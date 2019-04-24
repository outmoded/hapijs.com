'use strict';

const Boom = require('boom');
const Resources = require('./resources');
const Path = require('path');
const Plugins = require('./plugins');
const Tutorials = require('./tutorials');
const Utils = require('./utils');

module.exports = (server) => {

    const routes = [];
    const editLinkPrefix = 'https://github.com/hapijs/hapijs.com/edit/master';

    routes.push({
        method: 'GET',
        path: '/',
        options: {
            pre: [
                [
                    { method: server.methods.npm.version, assign: 'version' },
                    { method: server.methods.npm.downloads, assign: 'downloads' },
                    { method: server.methods.github.issues, assign: 'issues' },
                    { method: server.methods.github.commits, assign: 'commits' }
                ],
                { method: server.methods.github.latestUpdate, assign: 'latestUpdate' }
            ],
            handler: (request, reply) => reply.view('index', { ...request.pre, editLink: `${editLinkPrefix}/templates/index.pug` })
        }
    });


    routes.push({
        method: 'GET',
        path: '/hapidays',
        options: {
            handler: (request, reply) => reply.view('hapidays', { editLink: `${editLinkPrefix}/templates/hapidays.pug` })
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

                return reply.view('updates', { ...request.pre, editLink: `${editLinkPrefix}/templates/updates.pug` });
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
                const tutorialSlug = request.params.tutorial || 'getting-started';

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

                return reply.view('tutorial', { ...context, editLink: `${editLinkPrefix}/lib/tutorials/${language}/${tutorialSlug}.md` });
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
            pre: [
                { method: server.methods.github.repos, assign: 'repos' },
                [
                    { method: server.methods.npm.version, assign: 'latest' },
                    { method: server.methods.npm.versions, assign: 'versions' },
                    { method: server.methods.github.apiModules, assign: 'apiModules' }
                ]
            ],
            handler: async function (request, reply) {

                const { apiModules } = request.pre;
                const { latest, lts } = request.pre.versions['dist-tags'];
                const versions = Object.keys(request.pre.versions.versions);
                const latestV16 = Utils.findLatestOfMajor(versions, 16);
                const current = request.params.tag || request.pre.latest.version;
                const ref =  await request.server.methods.github.reference(current);
                const branchName = current === latest ? 'master' : 'v16';
                const editLink = `https://github.com/hapijs/hapi/edit/${branchName}/API.md`;
                return reply.view('api', { html: ref, versions: [latest, lts, latestV16], tag: current, editLink, apiModules });
            }
        }
    });


    routes.push({
        method: 'GET',
        path: '/plugins',
        options: {
            handler: (request, reply) => reply.view('plugins', { plugins: Plugins, editLink: `${editLinkPrefix}/lib/plugins.js` })
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
            handler: (request, reply) => reply.view('contribute', { ...request.pre, editLink: `${editLinkPrefix}/templates/contribute.pug` })
        }
    });


    routes.push({
        method: 'GET',
        path: '/styleguide',
        options: {
            pre: [
                { method: server.methods.github.styleGuide, assign: 'styleGuide' }
            ],
            handler: (request, reply) => reply.view('document', { title: 'hapi.js style guide', document: request.pre.styleGuide, editLink: 'https://github.com/hapijs/assets/edit/master/Style.md' })
        }
    });


    routes.push({
        method: 'GET',
        path: '/resources',
        options: {
            handler: (request, reply) => reply.view('resources', { resources: Resources, editLink: `${editLinkPrefix}/lib/resources.js` })
        }
    });


    routes.push({
        method: 'GET',
        path: '/help',
        options: {
            handler: (request, reply) => reply.view('help', { editLink: `${editLinkPrefix}/templates/help.pug` })
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
