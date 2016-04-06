var Async = require('async');
var Config = require('getconfig');
var Hoek = require('hoek');
var Utils = require('./utils');
var Querystring = require('querystring');
var Semver = require('semver');

var internals = {};

internals.requestOptions = {
    headers: {
        'user-agent': 'hapijs.com',
        'authorization': 'token ' + Config.githubToken
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
            expiresIn: Utils.fifteenMinutes
        }
    }
});

exports.methods.push({
    name: 'github.issues',
    method: function (callback) {

        var weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        var params = Querystring.encode({
            sort: 'created',
            state: 'closed',
            since: weekAgo.toISOString()
        });

        return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, internals.requestOptions, function (err, issues) {

            if (err) {
                return callback(err);
            }

            issues = issues.filter(function (issue) {

                return !issue.hasOwnProperty('pull_request');
            });

            callback(null, issues);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes
        }
    }
});

exports.methods.push({
    name: 'github.pullRequests',
    method: function (callback) {

        var weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        var params = Querystring.encode({
            sort: 'created',
            direction: 'desc',
            state: 'closed',
            since: weekAgo.toISOString()
        });

        return Utils.download('https://api.github.com/repos/hapijs/hapi/pulls?' + params, internals.requestOptions, function (err, payload) {

            if (err) {
                return callback(err);
            }

            payload = payload.filter(function (p) {

                return p.merged_at;
            });

            callback(null, payload);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes
        }
    }
});

exports.methods.push({
    name: 'github.governance',
    method: function (callback) {

        var options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: {
                accept: 'application/vnd.github.3.html'
            }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Governance.md', options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay
        }
    }
});

exports.methods.push({
    name: 'github.styleGuide',
    method: function (callback) {

        var options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: {
                accept: 'application/vnd.github.3.html'
            }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Style.md', options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay
        }
    }
});

exports.methods.push({
    name: 'github.guidelines',
    method: function (callback) {

        var options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: {
                accept: 'application/vnd.github.3.html'
            }
        });

        return Utils.download('https://api.github.com/repos/hapijs/contrib/contents/Guidelines.md', options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay
        }
    }
});

exports.methods.push({
    name: 'github.latestUpdate',
    method: function (request, callback) {

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

        callback(null, latest);
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes
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
            expiresIn: Utils.oneDay
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
            expiresIn: Utils.fifteenMinutes
        }
    }
});

exports.methods.push({
    name: 'github.reference',
    method: function (ref, callback) {

        var options = Hoek.applyToDefaults(internals.requestOptions, {
            headers: {
                accept: 'application/vnd.github.3.html'
            }
        });

        var path;
        if (Semver.lt(ref, '7.0.0')) {
            path = 'https://api.github.com/repos/hapijs/hapi/contents/docs/Reference.md?ref=v' + ref;
        }
        else {
            path = 'https://api.github.com/repos/hapijs/hapi/contents/API.md?ref=v' + ref;
        }

        return Utils.download(path, options, callback);
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear
        }
    }
});

exports.methods.push({
    name: 'github.newContributorIssues',
    method: function (request, callback) {

        var params = Querystring.encode({
            labels: 'new contributor'
        });

        var repos = request.pre.repos.filter(function (repo) {

            return repo.open_issues > 0;
        }).map(function (repo) {

            return repo.name;
        });

        var newContributorIssues = [];

        Async.eachLimit(repos, 10, function (repo, cb) {

            Utils.download('https://api.github.com/repos/hapijs/' + repo + '/issues?' + params, internals.requestOptions, function (err, issues) {

                if (err) {
                    return cb(err);
                }

                issues = issues.map(function (issue) {

                    issue.repo = repo;
                    return issue;
                });

                newContributorIssues = newContributorIssues.concat(issues);
                cb();
            });
        }, function (err) {

            if (err) {
                return next(err);
            }

            callback(null, newContributorIssues);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes
        },
        generateKey: function () {

            return 'newContributorIssues';
        }
    }
});

exports.methods.push({
    name: 'github.helpWantedIssues',
    method: function (request, callback) {

        var params = Querystring.encode({
            labels: 'help wanted'
        });

        var repos = request.pre.repos.filter(function (repo) {

            return repo.open_issues > 0;
        }).map(function (repo) {

            return repo.name;
        });

        var helpWantedIssues = [];

        Async.eachLimit(repos, 10, function (repo, cb) {

            Utils.download('https://api.github.com/repos/hapijs/' + repo + '/issues?' + params, internals.requestOptions, function (err, issues) {

                if (err) {
                    return cb(err);
                }

                issues = issues.map(function (issue) {

                    issue.repo = repo;
                    return issue;
                });

                helpWantedIssues = helpWantedIssues.concat(issues);
                cb();
            });
        }, function (err) {

            if (err) {
                return next(err);
            }

            callback(null, helpWantedIssues);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes
        },
        generateKey: function () {

            return 'helpWantedIssues';
        }
    }
});
