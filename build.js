#!/usr/bin/env node

var Fs = require('fs');
var Github = require('./lib/github');
var Jade = require('jade');
var Markdown = require('./lib/markdown');
var Npm = require('./lib/npm');
var Path = require('path');

// input paths
var templatesPath = Path.join(__dirname, 'templates');

// the output path
var cachePath = Path.join(__dirname, '.cache');
var finalPath = Path.join(__dirname, 'output');

var error = function (err) {

    console.error(err.message);
    process.exit(1);
};

// wrapper to take callback output and write it to a file
var writeFile = function (file) {

    // hack to make sure paths are friendlier to write
    var isJson = /\.json$/.test(file);
    var filePath = Path.join(isJson ? cachePath : finalPath, file);

    return function (err, data) {

        if (err) {
            return error(err);
        }

        Fs.writeFileSync(filePath, isJson ? JSON.stringify(data) : data, 'utf8');
    };
};

var targets = {};
targets['issues.json'] = function (file) {

    Github.issues(writeFile(file));
};

targets['weeklyIssues.json'] = function (file) {

    Github.weeklyIssues(writeFile(file));
};

targets['commits.json'] = function (file) {

    Github.commits(writeFile(file));
};

targets['weeklyCommits.json'] = function (file) {

    Github.weeklyCommits(writeFile(file));
};

targets['tags.json'] = function (file) {

    Github.tags(writeFile(file));
};

targets.apiCache = function (tag) {

    Github.api(tag, function (err, content) {

        if (err) {
            return error(err);
        }

        content.tag = tag;
        Fs.writeFileSync(Path.join(cachePath, 'api', tag + '.json'), JSON.stringify(content), 'utf8');
    });
};

targets.api = function (tag, file) {

    var locals = require('./.cache/api/' + tag + '.json');
    locals.tags = require('./.cache/tags.json');

    Jade.renderFile(Path.join(templatesPath, 'api.jade'), locals, writeFile(file));
};

targets['downloads.json'] = function (file) {

    Npm.downloads(writeFile(file));
};

targets['changelog.json'] = function (file) {

    Github.changelog(writeFile(file));
};

targets.tutorial = function (title, file) {

    var tutorials = require('./lib/tutorials');

    Markdown.file(Path.join(__dirname, 'tutorials', title + '.md'), function (err, content) {

        if (err) {
            return error(err);
        }

        tutorials.html = content.html;
        tutorials.title = 'Tutorials | ' + content.title;
        tutorials.active = title;
        Jade.renderFile(Path.join(templatesPath, 'tutorial.jade'), tutorials, writeFile(file));
    });
};

targets['index.html'] = function (file) {

    var locals = require('./lib/locals');
    locals.companies = require('./lib/community');
    Markdown.file(Path.join(__dirname, 'index.md'), function (err, content) {

        if (err) {
            return error(err);
        }

        locals.guide = content.html;

        Jade.renderFile(Path.join(templatesPath, 'index.jade'), locals, writeFile(file));
    }, false, true);
};

targets['community.html'] = function (file) {

    Jade.renderFile(Path.join(templatesPath, 'community.jade'), require('./lib/community'), writeFile(file));
};

targets['updates.html'] = function (file) {

    var locals = require('./lib/locals');
    locals.changelog = require('./.cache/changelog.json');

    Jade.renderFile(Path.join(templatesPath, 'updates.jade'), locals, writeFile(file));
};

targets['plugins.html'] = function (file) {

    var Plugins = require('./lib/plugins');
    Jade.renderFile(Path.join(templatesPath, 'plugins.jade'), Plugins, writeFile(file));
};

targets['404.html'] = function (file) {

    Jade.renderFile(Path.join(templatesPath, '404.jade'), writeFile(file));
};

targets['500.html'] = function (file) {

    Jade.renderFile(Path.join(templatesPath, '500.jade'), writeFile(file));
};

targets['tags.mk'] = function () {

    var tags = require(Path.join(cachePath, 'tags.json')).map(function (tag) {
        return tag.name;
    });

    var mk = 'all: $(addprefix output/api/,$(addsuffix .html,' + tags.join(' ') + ' index))\n';
    Fs.writeFileSync(Path.join(cachePath, 'tags.mk'), mk, 'utf8');
};

var target = process.argv[2];
if (targets[target]) {
    targets[target](target);
}
else if (/^api\/[a-zA-Z0-9\.\-]+\.json$/.test(target)) {
    targets.apiCache(target.replace(/^api\/|\.json$/g, ''), target);
}
else if (/^api\/[a-zA-Z0-9\.\-]+\.html$/.test(target)) {
    targets.api(target.replace(/^api\/|\.html$/g, ''), target);
}
else if (/^tutorials\//.test(target)) {
    targets.tutorial(target.replace(/^tutorials\/|\.html$/g, ''), target);
}
else {
    console.error('Unknown target: ' + target);
    process.exit(1);
}
