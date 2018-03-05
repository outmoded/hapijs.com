'use strict';

const debugMilestones = require('debug')('changelog:milestones');
const debugBuild = require('debug')('changelog:build');
const debugIssues = require('debug')('changelog:issues');
const PromiseLimit = require('p-limit');
const Config = require('getconfig');
const Semver = require('semver');
const Utils = require('./utils');
const Querystring = require('querystring');

const limit = PromiseLimit(10);
const limit2 = PromiseLimit(10);

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
    method: async function () {

        debugMilestones('milestones');
        const params = Querystring.encode({
            state: 'closed',
            per_page: internals.perPage
        });

        const milestones = await Utils.downloadAllPages(`https://api.github.com/repos/hapijs/hapi/milestones?${params}`, internals.perPage, internals.requestOptions);

        milestones.sort((a, b) => Semver.compare(b.title, a.title));
        debugMilestones('milestones', milestones.length);
        return milestones;
    },
    options: {
        cache: {
            expiresIn: Utils.oneHour,
            staleIn: Utils.fifteenMinutes,
            staleTimeout: 1000,
            generateTimeout: Utils.oneMinute
        },
        generateKey:() => 'changelogMilestones'

    }
});


exports.methods.push({
    name: 'changelog.build',
    method: function (request) {

        debugBuild('BUILD');
        const methods = request.server.methods.changelog;
        const changelog = { };

        const getDependencyIssues = async function (issue) {

            debugBuild('getDependencyIssues');
            const result = await methods.getDependencyIssues(request, issue.title);

            if (!result) {
                return null;
            }

            issue.pluginIssues = {
                repo: `${internals.hapiOrg}/${result.repo}`,
                issues: result.issues
            };
            return issue;
        };


        const checkForDependencies = async function (issues) {

            debugBuild('checkForDependencies', issues.length);
            if (issues.length > 0) {
                const depIssueCalls = issues.map((issue) => limit2(() => getDependencyIssues(issue)));
                debugBuild('checkForDependencies depIssueCalls', depIssueCalls.length);
                const things = await Promise.all(depIssueCalls);
                debugBuild('checkForDependencies complete return things', things.length);
                return things;
            }
            debugBuild('checkForDependencies return null');
            return null;
        };

        const getIssues = async function (milestone) {

            const issues = await methods.issuesForMilestone('hapi', milestone.number);
            changelog[milestone.title] = issues;
            debugBuild('issues to check for');
            return checkForDependencies(issues);
        };
        debugBuild('BUILD BEFORE THE PROMISE');
        return new Promise((resolve, reject) => {

            debugBuild('before the all');
            return Promise.all(request.pre.milestones.map((m) => limit(() => getIssues(m)))).then(() => {

                debugBuild('changelog???', changelog.length);
                return resolve(changelog);
            });
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneHour,
            staleIn: Utils.fifteenMinutes,
            staleTimeout: 1000,
            generateTimeout: Utils.oneMinute * 5
        },
        generateKey: () => 'changelog'
    }
});

exports.methods.push({
    name: 'changelog.getDependencyIssues',
    method: async  function (request, issueTitle) {

        debugIssues('get dep issues called');
        const methods = request.server.methods.changelog;
        const matches = issueTitle.match(internals.dependencyRegex);

        if (!matches) {
            return null;
        }

        if (matches[1] !== internals.hapiOrg) {
            return null;
        }

        const repo = matches[2];
        const v1 = matches[3];
        const v2 = matches[4];
        const newVersion = Semver.gt(v1, v2) ? v1 : v2;

        const number = await methods.getMilestoneNumberFromTitle(repo, newVersion);

        if (!number) {
            return null;
        }

        const issues = await methods.issuesForMilestone(repo, number);
        debugIssues('return get dep issues');
        return { repo, issues };

    }
});

exports.methods.push({
    name: 'changelog.issuesForMilestone',
    method: function (repo, milestoneNumber) {

        debugIssues('issues for milestone called');
        const params = Querystring.encode({
            state: 'closed',
            milestone: milestoneNumber,
            per_page: internals.perPage
        });

        return Utils.downloadAllPages(`https://api.github.com/repos/hapijs/${repo}/issues?${params}`, internals.perPage, internals.requestOptions);
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear,
            generateTimeout: Utils.oneMinute
        },
        generateKey: (...args) => `changelog.issuesForMilestone.${args[0]}.${args[1]}`
    }
});

exports.methods.push({
    name: 'changelog.getMilestoneNumberFromTitle',
    method: async function (repo, milestoneTitle) {

        const params = Querystring.encode({
            state: 'closed',
            per_page: internals.perPage
        });

        const milestones = await Utils.downloadAllPages(`https://api.github.com/repos/hapijs/${repo}/milestones?${params}`, internals.perPage, internals.requestOptions);
        debugIssues('get milestones from title', milestones.length);

        for (let i = 0; i < milestones.length; ++i) {
            if (milestones[i].title === milestoneTitle) {
                debugIssues('return milestone', milestones[i].number);
                return   milestones[i].number;
            }
        }
        debugIssues('return null');
        return null;
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear,
            generateTimeout: Utils.oneMinute * 5
        },
        generateKey: () => 'changelog.getMilestoneNumberFromTitle'
    }
});
