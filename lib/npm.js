'use strict';

const Semver = require('semver');
const Utils = require('./utils');


exports.methods = [];


exports.methods.push({
    name: 'npm.version',
    method: function (callback) {

        return Utils.download('https://registry.npmjs.org/hapi/latest', { json: true, rejectUnauthorized: false }, (err, body) => {

            return callback(err, body && body.version);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        }
    }
});


exports.methods.push({
    name: 'npm.versions',
    method: function (callback) {

        return Utils.download('https://registry.npmjs.org/hapi', { json: true, rejectUnauthorized: false }, (err, body) => {

            return callback(err, body && body.versions && Object.keys(body.versions).sort(Semver.rcompare));
        });
    },
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        }
    }
});


exports.methods.push({
    name: 'npm.downloads',
    method: function (callback) {

        return Utils.download('https://api.npmjs.org/downloads/point/last-month/hapi', { json: true, rejectUnauthorized: false }, (err, body) => {

            return callback(err, body && body.downloads && String(body.downloads).replace(/\B(?=(?:\d{3})+(?!\d))/g, ','));
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        }
    }
});
