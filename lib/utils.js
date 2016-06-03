'use strict';

const Async = require('async');
const Wreck = require('wreck');


exports.download = function (url, options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    Wreck.get(url, options, (err, res, payload) => {

        if (err || res.statusCode !== 200) {
            return callback(err || new Error('ERROR: Failed to download, got statusCode: ' + res.statusCode));
        }

        if (/vnd\.github/.test(res.headers['content-type'])) {
            payload = payload.toString();
        }

        callback(null, payload);
    });
};


exports.downloadAllPages = function (url, perPage, options, callback) {

    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    let page = 1;
    let result = [];
    let lastSize;

    const fn = function (cb) {

        Wreck.get(`${url}&page=${page}`, options, (err, res, payload) => {

            if (err || res.statusCode !== 200) {
                return cb(err || new Error('ERROR: Failed to download, got statusCode: ' + res.statusCode));
            }

            result = result.concat(payload);
            lastSize = payload.length;
            page++;
            return cb();
        });
    };

    const test = () => lastSize !== perPage;

    Async.doUntil(fn, test, (err) => {

        if (err) {
            return callback(err);
        }

        return callback(null, result);
    });
};

exports.oneMinute = 60000;
exports.fifteenMinutes = 900000;
exports.oneHour = 3600000;
exports.oneDay = 86400000;
exports.oneYear = 31556900000;
