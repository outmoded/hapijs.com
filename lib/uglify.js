var Config = require('getconfig');
var Fs = require('fs');
var Path = require('path');
var Uglify = require('uglify-js');

var internals = {
    inputFiles: [
        Path.join('public', 'js', 'jquery.js'),
        Path.join('public', 'js', 'responsive-nav.js'),
        Path.join('public', 'js', 'app.js')
    ]
};

exports.register = function (plugin, options, next) {

    if (Config.getconfig.env !== 'production') {
        plugin.ext('onRequest', function (request, reply) {

            if (request.path !== '/public/js/app.min.js' &&
               request.path !== '/public/js/app.min.js.map') {
                return reply();
            }

            var result = Uglify.minify(internals.inputFiles, { outSourceMap: '/public/js/app.min.js.map', sourceRoot: '/' });

            if (/\.js$/.test(request.path)) {
                reply(result.code).type('application/javascript');
            }
            else {
                reply(result.map).type('application/json');
            }
        });
    }
    else {
        if (!Fs.existsSync('public/js/app.min.js')) {
            throw new Error('app.min.js not found, don\'t forget to run make!');
        }
    }

    next();
};

exports.register.attributes = {
    name: 'uglify',
    version: '1.0.0'
};
