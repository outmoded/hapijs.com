'use strict';

const Async = require('async');
const Config = require('getconfig');
const Hoek = require('hoek');
const Utils = require('./utils');
const Querystring = require('querystring');
const Semver = require('semver');


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
    method: function (callback) {

        return Utils.download('https://api.github.com/repos/hapijs/hapi/commits', internals.requestOptions, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        }
    }
});


exports.methods.push({
    name: 'github.issues',
    method: function (callback) {

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const params = Querystring.encode({
            sort: 'created',
            state: 'closed',
            since: weekAgo.toISOString()
        });

        return Utils.download(`https://api.github.com/repos/hapijs/hapi/issues?${params}`, internals.requestOptions, (err, issues) => {

            if (err) {
                return callback(err);
            }

            issues = issues.filter((issue) => !issue.pull_request);
            return callback(null, issues);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        }
    }
});


exports.methods.push({
    name: 'github.pullRequests',
    method: function (callback) {

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const params = Querystring.encode({
            sort: 'created',
            direction: 'desc',
            state: 'closed',
            since: weekAgo.toISOString()
        });

        return Utils.download(`https://api.github.com/repos/hapijs/hapi/pulls?${params}`, internals.requestOptions, (err, payload) => {

            if (err) {
                return callback(err);
            }

            return callback(null, payload.filter((p) => p.merged_at));
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        }
    }
});

exports.methods.push({
    name: 'github.governance',
    method: function (callback) {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: { accept: 'application/vnd.github.3.html' }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Governance.md', options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        }
    }
});

exports.methods.push({
    name: 'github.styleGuide',
    method: function (callback) {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: { accept: 'application/vnd.github.3.html' }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Style.md', options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        }
    }
});

exports.methods.push({
    name: 'github.guidelines',
    method: function (callback) {

        const options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: { accept: 'application/vnd.github.3.html' }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Guidelines.md', options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        }
    }
});

exports.methods.push({
    name: 'github.latestUpdate',
    method: function (request, callback) {

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

        return callback(null, latest);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: function () {

            return 'latestUpdate';
        }
    }
});

exports.methods.push({
    name: 'github.repos',
    method: function (callback) {

        return Utils.download('https://api.github.com/orgs/hapijs/repos', internals.requestOptions, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        }
    }
});


exports.methods.push({
    name: 'github.tags',
    method: function (callback) {

        return Utils.download('https://api.github.com/repos/hapijs/hapi/tags', internals.requestOptions, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        }
    }
});


exports.methods.push({
    name: 'github.reference',
    method: function (ref, callback) {

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

        return Utils.download(path, options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear,
            generateTimeout: Utils.oneMinute
        }
    }
});


exports.methods.push({
    name: 'github.newContributorIssues',
    method: function (request, callback) {

        const params = Querystring.encode({
            labels: 'new contributor'
        });

        const repos = request.pre.repos.filter((repo) => repo.open_issues > 0).map((repo) => repo.name);

        let newContributorIssues = [];

        Async.eachLimit(repos, 10, (repo, cb) => {

            Utils.download(`https://api.github.com/repos/hapijs/${repo}/issues?${params}`, internals.requestOptions, (err, issues) => {

                if (err) {
                    return cb(err);
                }

                issues = issues.map((issue) => {

                    issue.repo = repo;
                    return issue;
                });

                newContributorIssues = newContributorIssues.concat(issues);
                return cb();
            });
        }, (err) => {

            if (err) {
                return next(err);
            }

            return callback(null, newContributorIssues);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: function () {

            return 'newContributorIssues';
        }
    }
});


exports.methods.push({
    name: 'github.helpWantedIssues',
    method: function (request, callback) {

        const params = Querystring.encode({
            labels: 'help wanted'
        });

        const repos = request.pre.repos.filter((repo) => repo.open_issues > 0).map((repo) => repo.name);

        let helpWantedIssues = [];

        Async.eachLimit(repos, 10, (repo, cb) => {

            Utils.download(`https://api.github.com/repos/hapijs/${repo}/issues?${params}`, internals.requestOptions, (err, issues) => {

                if (err) {
                    return cb(err);
                }

                issues = issues.map((issue) => {

                    issue.repo = repo;
                    return issue;
                });

                helpWantedIssues = helpWantedIssues.concat(issues);
                return cb();
            });
        }, (err) => {

            if (err) {
                return next(err);
            }

            return callback(null, helpWantedIssues);
        });
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
