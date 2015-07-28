var Async = require('async');
var Wreck = require('wreck');

exports.download = function (url, options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    Wreck.get(url, options, function (err, res, payload) {

        if (err || res.statusCode !== 200) {
            console.log(res.statusCode);
            console.log(payload);
            return callback(err || new Error('ERROR: Failed to download, got statusCode: ' + res.statusCode));
        }

        callback(null, payload);
    });
};

exports.downloadAllPages = function (url, perPage, options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    var page = 1;
    var result = [];
    var lastSize;

    var fn = function (cb) {

        Wreck.get(url + '&page=' + page, options, function (err, res, payload) {

            if (err || res.statusCode !== 200) {
                console.log(res.statusCode);
                console.log(payload);
                return cb(err || new Error('ERROR: Failed to download, got statusCode: ' + res.statusCode));
            }

            result = result.concat(payload);
            lastSize = payload.length;
            page++;
            cb(null);
        });
    };

    var test = function () {

        return lastSize !== perPage;
    };

    Async.doUntil(fn, test, function (err) {

        if (err) {
            return callback(err);
        }

        callback(null, result);
    });
};

exports.fifteenMinutes = 900000;
exports.oneHour = 3600000;
exports.oneDay = 86400000;
exports.oneYear = 31556900000;
