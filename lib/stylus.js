var Config = require('getconfig');
var Fs = require('fs');
var Path = require('path');
var Stylus = require('stylus');

var internals = {
    path: '/public/css/main.css',
    input: Path.join(__dirname, '..', 'public', 'css', 'main.styl'),
    output: Path.join(__dirname, '..', 'public', 'css', 'main.css')
};

exports.register = function (plugin, options, next) {

    if (Config.getconfig.env !== 'production') {
        plugin.ext('onRequest', function (request, reply) {

            if (request.path !== '/public/css/main.css') {
                return reply();
            }

            var input = Fs.readFileSync(internals.input, 'utf8');
            Stylus.render(input, { filename: internals.output }, function (err, css) {

                if (err) {
                    reply(err);
                }

                reply(css).type('text/css');
            });
        });
    }

    next();
};

exports.register.attributes = {
    name: 'stylus',
    version: '1.0.0'
};
