'use strict';
const debug = require('debug')('github');
const PromiseLimit = require('p-limit');
const Config = require('getconfig');
const Hoek = require('hoek');
const Utils = require('./utils');
const Querystring = require('querystring');
const Semver = require('semver');

const limit = PromiseLimit(5);

const internals = {};

internals.requestOptions = {
    headers: {
        'user-agent': 'hapijs.com',
        authorization: `token ${Config.githubToken}`
    },
    json: true
};


exports.methods = [];


exports.methods.push({
    name: 'github.commits',
    method: function () {

        debug('commits');
        return Utils.download('https://api.github.com/repos/hapijs/hapi/commits', internals.requestOptions);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.commits'
    }
});


exports.methods.push({
    name: 'github.issues',
    method: async function () {

        debug('github issues');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const params = Querystring.encode({
            sort: 'created',
            state: 'closed',
            since: weekAgo.toISOString()
        });

        const issues = await Utils.download(`https://api.github.com/repos/hapijs/hapi/issues?${params}`, internals.requestOptions);
        debug('return issues');
        return  issues.filter((issue) => !issue.pull_request);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.issues'
    }
});


exports.methods.push({
    name: 'github.pullRequests',
    method: async function () {

        debug('pull requests');
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const params = Querystring.encode({
            sort: 'created',
            direction: 'desc',
            state: 'closed',
            since: weekAgo.toISOString()
        });

        const result =  await Utils.download(`https://api.github.com/repos/hapijs/hapi/pulls?${params}`, internals.requestOptions);
        debug('return pull requests');
        return result.filter((p) => p.merged_at);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.pullRequests'
    }
});

exports.methods.push({
    name: 'github.governance',
    method: function () {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: { accept: 'application/vnd.github.3.html' }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Governance.md', options);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.governance'
    }
});

exports.methods.push({
    name: 'github.styleGuide',
    method: function () {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: { accept: 'application/vnd.github.3.html' }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Style.md', options);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.styleGuide'
    }
});

exports.methods.push({
    name: 'github.guidelines',
    method: function () {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: { accept: 'application/vnd.github.3.html' }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Guidelines.md', options);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.guidelines'
    }
});

exports.methods.push({
    name: 'github.latestUpdate',
    method: function (request) {

        const latestCommit = request.pre.commits[0];
        const latestIssue = request.pre.issues[0];
        const latest = {};

        if (latestCommit && !latestIssue || (latestCommit && latestIssue && new Date(latestCommit.commit.committer.date).getTime() > new Date(latestIssue.updated_at).getTime())) {
            latest.title = latestCommit.commit.message;
            latest.updated = latestCommit.commit.committer.date;
            latest.url = latestCommit.html_url;
        }
        else if (latestIssue) {
            latest.title = latestIssue.title;
            latest.updated = latestIssue.updated_at;
            latest.url = latestIssue.html_url;
        }

        return latest;
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.latestUpdate'
    }
});

exports.methods.push({
    name: 'github.repos',
    method: () => Utils.download('https://api.github.com/orgs/hapijs/repos', internals.requestOptions),
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.repos'
    }
});


exports.methods.push({
    name: 'github.tags',
    method: () => Utils.download('https://api.github.com/repos/hapijs/hapi/tags', internals.requestOptions),
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'github.tags'
    }
});


exports.methods.push({
    name: 'github.reference',
    method: function (ref) {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: {
                accept: 'application/vnd.github.3.html'
            }
        });

        let path;
        if (Semver.lt(ref, '8.0.0')) {
            path = 'https://api.github.com/repos/hapijs/hapi/contents/docs/Reference.md?ref=v' + ref;
        }
        else {
            path = 'https://api.github.com/repos/hapijs/hapi/contents/API.md?ref=v' + ref;
        }

        return Utils.download(path, options);
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear,
            generateTimeout: Utils.oneMinute
        },
        generateKey: (tag) => `github.reference.${tag}`
    }
});


exports.methods.push({
    name: 'github.newContributorIssues',
    method: async function (request) {

        const params = Querystring.encode({
            labels: 'good first issue'
        });

        const repos = request.pre.repos.filter((repo) => repo.open_issues > 0).map((repo) => repo.name);

        const result = await Promise.all(repos.map((repo) => {

            return limit(async () => {

                const issues = await Utils.download(`https://api.github.com/repos/hapijs/${repo}/issues?${params}`, internals.requestOptions);
                return issues.map((issue) => {

                    issue.repo = repo;
                    return issue;
                });

            });
        }));
        return [].concat(...result);

    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'newContributorIssues'
    }
});


exports.methods.push({
    name: 'github.helpWantedIssues',
    method: async function (request) {

        const params = Querystring.encode({
            labels: 'help wanted'
        });

        const repos = request.pre.repos.filter((repo) => repo.open_issues > 0).map((repo) => repo.name);

        const result = await Promise.all(repos.map((repo) => {

            return limit(async () => {

                const issues = await Utils.download(`https://api.github.com/repos/hapijs/${repo}/issues?${params}`, internals.requestOptions);
                return issues.map((issue) => {

                    issue.repo = repo;
                    return issue;
                });
            });
        }));
        return [].concat(...result);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: function () {

            return 'helpWantedIssues';
        }
    }
});

exports.methods.push({
    name: 'github.apiModules',
    method: async function (request) {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: {
                accept: 'application/vnd.github.3.html'
            }
        });

        const repoNames = request.pre.repos.filter((repo) => !repo.archived).map((repo) => repo.name);
        const apiDocPromises =
            repoNames.map((name) => Utils.download(`https://api.github.com/repos/hapijs/${name}/contents/API.md`, options));
        const apiDocsResults = await Promise.all(apiDocPromises);
        const moduleWithApis = apiDocsResults.reduce((acc, doc, index) => {

            return doc && repoNames[index] !== 'hapi' ? [...acc, { name: repoNames[index], html: doc }] : acc;
        }, []);

        moduleWithApis.sort((a, b) => {

            if (a.name < b.name) {
                return -1;
            }
            else if (a.name > b.name) {
                return 1;
            }

            return 0;
        });

        return moduleWithApis;
    }
});
