var Downloads = require('../.cache/downloads.json');
var Issues = require('../.cache/issues.json');
var WeeklyIssues = require('../.cache/weeklyIssues.json');
var Commits = require('../.cache/commits.json');
var WeeklyCommits = require('../.cache/weeklyCommits.json');
var Tags = require('../.cache/tags.json');

exports.issues = Issues.filter(function (issue) {

    return !issue.hasOwnProperty('pull_request');
});

exports.weeklyIssues = WeeklyIssues.filter(function (issue) {

    return !issue.hasOwnProperty('pull_request');
});

exports.pullRequests = Issues.filter(function (issue) {

    return issue.hasOwnProperty('pull_request');
});

exports.weeklyPullRequests = WeeklyIssues.filter(function (issue) {

    return issue.hasOwnProperty('pull_request');
});

exports.latestUpdate = (function () {

    var latestCommit = Commits[0];
    var latestIssue = Issues[0];
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

    return latest;
})();

exports.commits = Commits;
exports.weeklyCommits = WeeklyCommits;
exports.tags = Tags;
exports.downloads = Downloads;
