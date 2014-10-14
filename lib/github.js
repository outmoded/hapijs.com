// var Cheerio = require('cheerio');
// var Hoek = require('hoek');
// var Markdown = require('./markdown');
var Async = require('async');
var Config = require('getconfig');
var Utils = require('./utils');
var Querystring = require('querystring');

var internals = {};

internals.requestOptions = {
    headers: {
        'user-agent': 'hapijs.com',
        'authorization': 'token ' + Config.githubToken
    },
    json: true
};

internals.commits = function (next) {

    return Utils.download('https://api.github.com/repos/hapijs/hapi/commits', internals.requestOptions, next);
};

internals.repos = function (next) {

    return Utils.download('https://api.github.com/orgs/hapijs/repos', internals.requestOptions, next);
};

internals.governance = function (next) {

    return Utils.download('https://raw.githubusercontent.com/hapijs/hapi/master/docs/Governance.md', internals.requestOptions, next);
};

internals.styleGuide = function (next) {

    return Utils.download('https://raw.githubusercontent.com/hapijs/hapi/master/docs/Style.md', internals.requestOptions, next);
};

internals.guidelines = function (next) {

    return Utils.download('https://raw.githubusercontent.com/hapijs/contrib/master/Guidelines.md', internals.requestOptions, next);
};

internals.changelog = function (next) {

    return Utils.download('https://raw.githubusercontent.com/hapijs/hapi/master/CHANGELOG.md', internals.requestOptions, next);
};

internals.newContributorIssues = function (request, next) {

    var params = Querystring.encode({
        labels: 'new contributor'
    });

    var repos = request.pre.repos.filter(function (repo) {

        return repo.open_issues > 0;
    }).map(function (repo) {

        return repo.name;
    });

    var newContributorIssues = [];

    Async.eachLimit(repos, 10, function (repo, callback) {

        Utils.download('https://api.github.com/repos/hapijs/' + repo + '/issues?' + params, internals.requestOptions, function (err, issues) {

            if (err) {
                return callback(err);
            }

            issues = issues.map(function (issue) {

                issue.repo = repo;
                return issue;
            });

            newContributorIssues = newContributorIssues.concat(issues);
            callback();
        });
    }, function (err) {

        if (err) {
            return next(err);
        }

        next(null, newContributorIssues);
    });
};

internals.helpWantedIssues = function (request, next) {

    var params = Querystring.encode({
        labels: 'help wanted'
    });

    var repos = request.pre.repos.filter(function (repo) {

        return repo.open_issues > 0;
    }).map(function (repo) {

        return repo.name;
    });

    var helpWantedIssues = [];

    Async.eachLimit(repos, 10, function (repo, callback) {

        Utils.download('https://api.github.com/repos/hapijs/' + repo + '/issues?' + params, internals.requestOptions, function (err, issues) {

            if (err) {
                return callback(err);
            }

            issues = issues.map(function (issue) {

                issue.repo = repo;
                return issue;
            });

            helpWantedIssues = helpWantedIssues.concat(issues);
            callback();
        });
    }, function (err) {

        if (err) {
            return next(err);
        }

        next(null, helpWantedIssues);
    });
};

internals.issues = function (next) {
    
    var params = Querystring.encode({
        sort: 'created',
        state: 'closed'
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, internals.requestOptions, next);
};

internals.latestUpdate = function (request, next) {

    var latestCommit = request.pre.commits[0];
    var latestIssue = request.pre.issues[0];
    var latest = {};

    if (latestCommit && !latestIssue || (latestCommit && latestIssue && new Date(latestCommit.commit.committer.date).getTime() > new Date(latestIssue.updated_at).getTime())) {
        latest.title = latestCommit.commit.message;
        latest.updated = latestCommit.commit.committer.date;
        latest.url = latestCommit.html_url;
    } else if (latestIssue) {
        latest.title = latestIssue.title;
        latest.updated = latestIssue.updated_at;
        latest.url = latestIssue.html_url;
    }

    next(null, latest);
};

exports.register = function (plugin, options, next) {

    plugin.method({
        name: 'github.commits',
        fn: internals.commits,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'commits';
            }
        }
    });

    plugin.method({
        name: 'github.issues',
        fn: internals.issues,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'issues';
            }
        }
    });

    plugin.method({
        name: 'github.governance',
        fn: internals.governance,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'governance';
            }
        }
    });

    plugin.method({
        name: 'github.styleGuide',
        fn: internals.styleGuide,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'styleGuide';
            }
        }
    });

    plugin.method({
        name: 'github.guidelines',
        fn: internals.guidelines,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'guidelines';
            }
        }
    });

    plugin.method({
        name: 'github.changelog',
        fn: internals.changelog,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'changelog';
            }
        }
    });

    plugin.method({
        name: 'github.latestUpdate',
        fn: internals.latestUpdate,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'latestUpdate';
            }
        }
    });

    plugin.method({
        name: 'github.repos',
        fn: internals.repos,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'repos';
            }
        }
    });

    plugin.method({
        name: 'github.newContributorIssues',
        fn: internals.newContributorIssues,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'newContributorIssues';
            }
        }
    });

    plugin.method({
        name: 'github.helpWantedIssues',
        fn: internals.helpWantedIssues,
        options: {
            cache: {
                expiresIn: 900000
            },
            generateKey: function () {

                return 'helpWantedIssues';
            }
        }
    });

    next();
};

exports.register.attributes = {
    name: 'github',
    version: '1.0.0'
};
