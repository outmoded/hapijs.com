var Async = require('async');
var Config = require('getconfig');
var Semver = require('semver');
var Utils = require('./utils');
var Querystring = require('querystring');

var internals = {};

internals.dependencyRegex = /(?:update|upgrade) (\w+)\/(\w+) (?:from|to) (.*) (?:from|to) (.*)/i;

internals.hapiOrg = 'hapijs';

internals.perPage = 100;

internals.requestOptions = {
    headers: {
        'user-agent': 'hapijs.com',
        'authorization': 'token ' + Config.githubToken
    },
    json: true
};

exports.methods = [];

exports.methods.push({
    name: 'changelog.milestones',
    method: function (callback) {

        var params = Querystring.encode({
            state: 'closed',
            per_page: internals.perPage
        });

        return Utils.downloadAllPages('https://api.github.com/repos/hapijs/hapi/milestones?' + params, internals.perPage, internals.requestOptions, function (err, milestones) {

            if (err) {
                return callback(err);
            }

            var compare = function (a, b) {

                if (a.id < b.id) {
                    return 1;
                }
                if (a.id > b.id) {
                    return -1;
                }
                return 0;
            };

            callback(null, milestones.sort(compare));
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneHour,
            staleIn: Utils.fifteenMinutes,
            staleTimeout: 1000
        },
        generateKey: function () {

            return 'changelogMilestones';
        }
    }
});

exports.methods.push({
    name: 'changelog.build',
    method: function (request, callback) {

        var methods = request.server.methods.changelog;
        var changelog = { };

        var getDependencyIssues = function (issue, cb) {

            methods.getDependencyIssues(request, issue.title, function (result, err) {

                if (err) {
                    return cb(err);
                }

                if (!result) {
                    return cb(null);
                }

                issue.pluginIssues = {
                    repo: internals.hapiOrg + '/' + result.repo,
                    issues: result.issues
                };

                cb(null);
            });
        };

        var checkForDependencies = function (issues, cb) {

            if (issues.length > 0) {

                return Async.eachLimit(issues, 10, getDependencyIssues, function (err) {

                    if (err) {
                        return cb(err);
                    }

                    cb(null);
                });
            }

            cb(null);
        };

        var getIssues = function (milestone, cb) {

            methods.issuesForMilestone('hapi', milestone.number, function (err, issues) {

                if (err) {
                    return cb(err);
                }

                changelog[milestone.title] = issues;
                checkForDependencies(issues, cb);
            });
        };

        Async.eachLimit(request.pre.milestones, 10, getIssues, function (err) {

            if (err) {
                return callback(err);
            }

            callback(null, changelog);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneHour,
            staleIn: Utils.fifteenMinutes,
            staleTimeout: 1000
        },
        generateKey: function () {

            return 'changelog';
        }
    }
});

exports.methods.push({
    name: 'changelog.getDependencyIssues',
    method: function (request, issueTitle, callback) {

        var methods = request.server.methods.changelog;
        var matches = issueTitle.match(internals.dependencyRegex);

        if (!matches) {
            return callback(null);
        }

        if (matches[1] !== internals.hapiOrg) {
            return callback(null);
        }

        var repo = matches[2];
        var v1 = matches[3];
        var v2 = matches[4];
        var newVersion = Semver.gt(v1, v2) ? v1 : v2;

        methods.getMilestoneNumberFromTitle(repo, newVersion, function (err, number) {

            if (!number) {
                return callback(null);
            }

            if (err) {
                return callback(err);
            }

            methods.issuesForMilestone(repo, number, function (err, issues) {

                if (err) {
                    return callback(err);
                }

                callback({ repo: repo, issues: issues });
            });
        });
    }
});

exports.methods.push({
    name: 'changelog.issuesForMilestone',
    method: function (repo, milestoneNumber, callback) {

        var params = Querystring.encode({
            state: 'closed',
            milestone: milestoneNumber,
            per_page: internals.perPage
        });

        Utils.downloadAllPages('https://api.github.com/repos/hapijs/' + repo + '/issues?' + params, internals.perPage, internals.requestOptions, function (err, issues) {

            if (err) {
                return callback(err);
            }

            callback(null, issues);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear
        }
    }
});

exports.methods.push({
    name: 'changelog.getMilestoneNumberFromTitle',
    method: function (repo, milestoneTitle, callback) {

        var params = Querystring.encode({
            state: 'closed',
            per_page: internals.perPage
        });

        Utils.downloadAllPages('https://api.github.com/repos/hapijs/' + repo + '/milestones?' + params, internals.perPage, internals.requestOptions, function (err, milestones) {

            for (var i = 0; i < milestones.length; ++i) {
                if (milestones[i].title === milestoneTitle) {
                    return callback(null, milestones[i].number);
                }
            }

            callback(null, null);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear
        }
    }
});
