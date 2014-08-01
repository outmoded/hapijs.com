var Cheerio = require('cheerio');
var Hoek = require('hoek');
var Markdown = require('./markdown');
var Utils = require('./utils');
var Querystring = require('querystring');

var requestOptions = {
    headers: {
        'user-agent': 'hapijs.com'
    },
    json: true
};

if (process.env.GITHUB_TOKEN) {
    requestOptions.headers.authorization = 'token ' + process.env.GITHUB_TOKEN;
}

exports.weeklyIssues = function (callback) {

    var then = new Date();
    then.setDate(then.getDate() - 7);

    var params = Querystring.encode({
        sort: 'updated',
        state: 'closed',
        since: then.toISOString()
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, requestOptions, callback);
};

exports.issues = function (callback) {

    var params = Querystring.encode({
        sort: 'updated',
        state: 'closed'
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/issues?' + params, requestOptions, callback);
};

exports.weeklyCommits = function (callback) {

    var then = new Date();
    then.setDate(then.getDate() - 7);

    var params = Querystring.encode({
        since: then.toISOString()
    });

    return Utils.download('https://api.github.com/repos/hapijs/hapi/commits?' + params, requestOptions, callback);
};

exports.commits = function (callback) {

    return Utils.download('https://api.github.com/repos/hapijs/hapi/commits', requestOptions, callback);
};

exports.tags = function (callback) {

    return Utils.download('https://api.github.com/repos/hapijs/hapi/tags', requestOptions, callback);
};

exports.changelog = function (callback) {

    return Utils.download('https://raw.githubusercontent.com/hapijs/hapi/master/CHANGELOG.md', Hoek.applyToDefaults(requestOptions, { json: false }), function (err, markdown) {

        if (err) {
            return callback(err);
        }

        var contents = {};
        var $ = Cheerio.load(Markdown.render(markdown).html);

        $('h2').each(function () {
            var text = $(this).text();
            contents[text] = [];
            $(this).next('ul').children('li').each(function () {
                var liText = $(this).text().split(' ');
                contents[text].push({
                    number: liText[0],
                    text: liText.slice(1).join(' ')
                });
            });
        });

        callback(null, contents);
    });
};

exports.api = function (tag, callback) {

    return Utils.download('https://raw.githubusercontent.com/hapijs/hapi/' + tag + '/docs/Reference.md', Hoek.applyToDefaults(requestOptions, { json: false }), function (err, markdown) {

        if (err) {
            return callback(err);
        }

        callback(null, Markdown.render(markdown, true));
    });
};
