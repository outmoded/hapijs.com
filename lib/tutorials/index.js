var Fs = require('fs');
var Path = require('path');

exports.auth = {
    title: 'Authentication',
    contents: Fs.readFileSync(Path.join(__dirname, 'auth.md'), 'utf8')
};

exports.cookies = {
    title: 'Cookies',
    contents: Fs.readFileSync(Path.join(__dirname, 'cookies.md'), 'utf8')
};

exports['getting-started'] = {
    title: 'Getting Started',
    contents: Fs.readFileSync(Path.join(__dirname, 'getting-started.md'), 'utf8')
};

exports.logging = {
    title: 'Logging',
    contents: Fs.readFileSync(Path.join(__dirname, 'logging.md'), 'utf8')
};

exports.plugins = {
    title: 'Plugins',
    contents: Fs.readFileSync(Path.join(__dirname, 'plugins.md'), 'utf8')
};

exports.routing = {
    title: 'Routing',
    contents: Fs.readFileSync(Path.join(__dirname, 'routing.md'), 'utf8')
};

exports['server-methods'] = {
    title: 'Server Methods',
    contents: Fs.readFileSync(Path.join(__dirname, 'server-methods.md'), 'utf8')
};

exports['serving-files'] = {
    title: 'Serving Static Content',
    contents: Fs.readFileSync(Path.join(__dirname, 'serving-files.md'), 'utf8')
};

exports.validation = {
    title: 'Validation',
    contents: Fs.readFileSync(Path.join(__dirname, 'validation.md'), 'utf8')
};

exports.views = {
    title: 'Views',
    contents: Fs.readFileSync(Path.join(__dirname, 'views.md'), 'utf8')
};

exports.all = Object.keys(exports).map(function (slug) {
    return {
        slug: slug,
        title: exports[slug].title
    }
});

exports.default = exports['getting-started'];
