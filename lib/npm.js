var Utils = require('./utils');

exports.methods = [];

exports.methods.push({
    name: 'npm.version',
    method: function (callback) {

        return Utils.download('https://registry.npmjs.org/hapi/latest', { json: true, rejectUnauthorized: false }, function (err, body) {

            if (err) {
                return callback(err);
            }

            callback(null, body.version);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes
        }
    }
});

exports.methods.push({
    name: 'npm.downloads',
    method: function (callback) {

        return Utils.download('https://api.npmjs.org/downloads/point/last-month/hapi', { json: true, rejectUnauthorized: false }, function (err, body) {

            if (err) {
                return callback(err);
            }

            callback(null, String(body.downloads).replace(/\B(?=(?:\d{3})+(?!\d))/g, ','))
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay
        }
    }
});
