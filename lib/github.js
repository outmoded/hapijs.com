// var Cheerio = require('cheerio');
// var Hoek = require('hoek');
// var Markdown = require('./markdown');
var Utils = require('./utils');
var Querystring = require('querystring');

var internals = {};

internals.requestOptions = {
    headers: {
        'user-agent': 'hapijs.com'
    },
    json: true
};

internals.commits = function (request, next) {

    return Utils.download('https://api.github.com/repos/hapijs/hapi/commits', internals.requestOptions, next);
};

internals.issues = function (request, next) {

    var params = Querystring.encode({
        sort: 'updated',
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

    next();
};

exports.register.attributes = {
    name: 'github',
    version: '1.0.0'
};

// if (process.env.GITHUB_TOKEN) {
//     requestOptions.headers.authorization = 'token ' + process.env.GITHUB_TOKEN;
// }
//
// exports.weeklyIssues = function (callback) {
//
//     var then = new Date();
//     then.setDate(then.getDate() - 7);
//
//     var params = Querystring.encode({
//         sort: 'updated',
//         state: 'closed',
//         since: then.toISOString()
//     });
//
//     return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, requestOptions, callback);
// };
//
// exports.newContributorIssues = function (callback) {
//     
//     var params = Querystring.encode({
//         labels: 'new contributor'
//     });
//
//     return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, requestOptions, callback);
// };
//
// exports.helpWantedIssues = function (callback) {
//     
//     var params = Querystring.encode({
//         labels: 'help wanted'
//     });
//
//     return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, requestOptions, callback);
// };
//
// exports.weeklyCommits = function (callback) {
//
//     var then = new Date();
//     then.setDate(then.getDate() - 7);
//
//     var params = Querystring.encode({
//         since: then.toISOString()
//     });
//
//     return Utils.download('https://api.github.com/repos/hapijs/hapi/commits?' + params, requestOptions, callback);
// };
//
// exports.tags = function (callback) {
//
//     return Utils.download('https://api.github.com/repos/hapijs/hapi/tags', requestOptions, callback);
// };
//
// exports.changelog = function (callback) {
//
//     return Utils.download('https://raw.githubusercontent.com/hapijs/hapi/master/CHANGELOG.md', Hoek.applyToDefaults(requestOptions, { json: false }), function (err, markdown) {
//
//         if (err) {
//             return callback(err);
//         }
//
//         var contents = {};
//         var $ = Cheerio.load(Markdown.render(markdown).html);
//
//         $('h2').each(function () {
//             var text = $(this).text();
//             contents[text] = [];
//             $(this).next('ul').children('li').each(function () {
//                 var liText = $(this).text().split(' ');
//                 contents[text].push({
//                     number: liText[0],
//                     text: liText.slice(1).join(' ')
//                 });
//             });
//         });
//
//         callback(null, contents);
//     });
// };
//
// exports.api = function (tag, callback) {
//
//     return Utils.download('https://raw.githubusercontent.com/hapijs/hapi/' + tag + '/docs/Reference.md', Hoek.applyToDefaults(requestOptions, { json: false }), function (err, markdown) {
//
//         if (err) {
//             return callback(err);
//         }
//
//         callback(null, Markdown.render(markdown, true));
//     });
// };
