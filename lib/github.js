var Async = require('async');
var Config = require('getconfig');
var Hoek = require('hoek');
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

    var options = Hoek.applyToDefaults(internals.requestOptions, {
        headers: {
            accept: 'application/vnd.github.3.html'
        }
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/contents/docs/Governance.md', options, next);
};

internals.styleGuide = function (next) {

    var options = Hoek.applyToDefaults(internals.requestOptions, {
        headers: {
            accept: 'application/vnd.github.3.html'
        }
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/contents/docs/Style.md', options, next);
};

internals.guidelines = function (next) {

    var options = Hoek.applyToDefaults(internals.requestOptions, {
        headers: {
            accept: 'application/vnd.github.3.html'
        }
    });

    return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Guidelines.md', options, next);
};

internals.changelog = function (next) {

    var options = Hoek.applyToDefaults(internals.requestOptions, {
        headers: {
            accept: 'application/vnd.github.3.html'
        }
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/contents/CHANGELOG.md', options, next);
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
    
    var weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    var params = Querystring.encode({
        sort: 'created',
        state: 'closed',
        since: weekAgo.toISOString()
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, internals.requestOptions, next);
};

internals.pullRequests = function (next) {
    
    var weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    var params = Querystring.encode({
        sort: 'created',
        direction: 'desc',
        state: 'closed',
        since: weekAgo.toISOString()
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/pulls?' + params, internals.requestOptions, next);
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

    plugin.method('github.commits', internals.commits, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'commits';
        }
    });

    plugin.method('github.issues', internals.issues, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'issues';
        }
    });

    plugin.method('github.pullRequests', internals.pullRequests, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'pullRequests';
        }
    });

    plugin.method('github.governance', internals.governance, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'governance';
        }
    });

    plugin.method('github.styleGuide', internals.styleGuide, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'styleGuide';
        }
    });

    plugin.method('github.guidelines', internals.guidelines, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'guidelines';
        }
    });

    plugin.method('github.changelog', internals.changelog, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'changelog';
        }
    });

    plugin.method('github.latestUpdate', internals.latestUpdate, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'latestUpdate';
        }
    });

    plugin.method('github.repos', internals.repos, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'repos';
        }
    });

    plugin.method('github.newContributorIssues', internals.newContributorIssues, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'newContributorIssues';
        }
    });

    plugin.method('github.helpWantedIssues', internals.helpWantedIssues, {
        cache: {
            expiresIn: 900000
        },
        generateKey: function () {

            return 'helpWantedIssues';
        }
    });

    next();
};

exports.register.attributes = {
    name: 'github',
    version: '1.0.0'
};
