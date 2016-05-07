'use strict';

const Async = require('async');
const Config = require('getconfig');
const Semver = require('semver');
const Utils = require('./utils');
const Querystring = require('querystring');


const internals = {
    dependencyRegex: /(?:update|upgrade) (\w+)\/(\w+) (?:from|to) (.*) (?:from|to) (.*)/i,
    hapiOrg: 'hapijs',
    perPage: 100,
    requestOptions: {
        headers: {
            'user-agent': 'hapijs.com',
            'authorization': 'token ' + Config.githubToken
        },
        json: true
    }
};


exports.methods = [];


exports.methods.push({
    name: 'changelog.milestones',
    method: function (callback) {

        const params = Querystring.encode({
            state: 'closed',
            per_page: internals.perPage
        });

        return Utils.downloadAllPages(`https://api.github.com/repos/hapijs/hapi/milestones?${params}`, internals.perPage, internals.requestOptions, (err, milestones) => {

            if (err) {
                return callback(err);
            }

            callback(null, milestones.sort((a, b) => Semver.compare(b.title, a.title)));
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneHour,
            staleIn: Utils.fifteenMinutes,
            staleTimeout: 1000,
            generateTimeout: Utils.oneMinute
        },
        generateKey: function () {

            return 'changelogMilestones';
        }
    }
});


exports.methods.push({
    name: 'changelog.build',
    method: function (request, callback) {

        const methods = request.server.methods.changelog;
        const changelog = { };

        const getDependencyIssues = function (issue, cb) {

            methods.getDependencyIssues(request, issue.title, (result, err) => {

                if (err) {
                    return cb(err);
                }

                if (!result) {
                    return cb();
                }

                issue.pluginIssues = {
                    repo: `${internals.hapiOrg}/${result.repo}`,
                    issues: result.issues
                };

                return cb();
            });
        };

        const checkForDependencies = function (issues, cb) {

            if (issues.length > 0) {

                return Async.eachLimit(issues, 10, getDependencyIssues, (err) => {

                    if (err) {
                        return cb(err);
                    }

                    return cb();
                });
            }

            return cb();
        };

        const getIssues = function (milestone, cb) {

            methods.issuesForMilestone('hapi', milestone.number, (err, issues) => {

                if (err) {
                    return cb(err);
                }

                changelog[milestone.title] = issues;
                checkForDependencies(issues, cb);
            });
        };

        Async.eachLimit(request.pre.milestones, 10, getIssues, (err) => {

            if (err) {
                return callback(err);
            }

            return callback(null, changelog);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneHour,
            staleIn: Utils.fifteenMinutes,
            staleTimeout: 1000,
            generateTimeout: Utils.oneMinute * 5
        },
        generateKey: function () {

            return 'changelog';
        }
    }
});

exports.methods.push({
    name: 'changelog.getDependencyIssues',
    method: function (request, issueTitle, callback) {

        const methods = request.server.methods.changelog;
        const matches = issueTitle.match(internals.dependencyRegex);

        if (!matches) {
            return callback(null);
        }

        if (matches[1] !== internals.hapiOrg) {
            return callback(null);
        }

        const repo = matches[2];
        const v1 = matches[3];
        const v2 = matches[4];
        const newVersion = Semver.gt(v1, v2) ? v1 : v2;

        methods.getMilestoneNumberFromTitle(repo, newVersion, (err, number) => {

            if (!number) {
                return callback(null);
            }

            if (err) {
                return callback(err);
            }

            methods.issuesForMilestone(repo, number, (err, issues) => {

                if (err) {
                    return callback(err);
                }

                return callback({ repo, issues });
            });
        });
    }
});

exports.methods.push({
    name: 'changelog.issuesForMilestone',
    method: function (repo, milestoneNumber, callback) {

        const params = Querystring.encode({
            state: 'closed',
            milestone: milestoneNumber,
            per_page: internals.perPage
        });

        Utils.downloadAllPages(`https://api.github.com/repos/hapijs/${repo}/issues?${params}` + params, internals.perPage, internals.requestOptions, (err, issues) => {

            if (err) {
                return callback(err);
            }

            return callback(null, issues);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear,
            generateTimeout: Utils.oneMinute
        }
    }
});

exports.methods.push({
    name: 'changelog.getMilestoneNumberFromTitle',
    method: function (repo, milestoneTitle, callback) {

        const params = Querystring.encode({
            state: 'closed',
            per_page: internals.perPage
        });

        Utils.downloadAllPages(`https://api.github.com/repos/hapijs/${repo}/milestones?${params}`, internals.perPage, internals.requestOptions, (err, milestones) => {

            if (err) {
                return callback(err);
            }

            for (let i = 0; i < milestones.length; ++i) {
                if (milestones[i].title === milestoneTitle) {
                    return callback(null, milestones[i].number);
                }
            }

            return callback(null, null);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear,
            generateTimeout: Utils.oneMinute * 5
        }
    }
});
