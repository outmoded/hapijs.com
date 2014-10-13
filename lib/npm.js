var Utils = require('./utils');
var internals = {};

internals.version = function (callback) {

    return Utils.download('https://registry.npmjs.org/hapi/latest', { json: true, rejectUnauthorized: false }, function (err, body) {

        if (err) {
            return callback(err);
        }

        callback(null, body.version);
    });
};

internals.downloads = function (callback) {

    return Utils.download('https://api.npmjs.org/downloads/point/last-month/hapi', { json: true, rejectUnauthorized: false }, function (err, body) {

        if (err) {
            return callback(err);
        }

        callback(null, String(body.downloads).replace(/\B(?=(?:\d{3})+(?!\d))/g, ','))
    });
};

exports.register = function (plugin, options, next) {

    plugin.method({
        name: 'npm.version',
        fn: internals.version,
        options: {
            cache: {
                expiresIn: 604800000,
                staleIn: 600000,
                staleTimeout: 600000
            },
            generateKey: function () {

                return 'version';
            }
        }
    });

    plugin.method({
        name: 'npm.downloads',
        fn: internals.downloads,
        options: {
            cache: {
                expiresIn: 86400000
            },
            generateKey: function () {

                return 'downloads';
            }
        }
    });

    next();
};

exports.register.attributes = {
    name: 'npm',
    version: '1.0.0'
};
