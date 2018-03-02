'use strict';

const Utils =  require('./utils');

exports.methods = [];

exports.methods.push({
    name: 'npm.version',
    method: () => Utils.download('https://registry.npmjs.org/hapi/latest', { json: true, rejectUnauthorized: false }),
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'npm.version'
    }
});


exports.methods.push({
    name: 'npm.versions',
    method: () => Utils.download('https://registry.npmjs.org/hapi', { json: true, rejectUnauthorized: false }),
    options: {
        cache: {
            expiresIn: Utils.fifteenMinutes,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'npm.versions'
    }
});


exports.methods.push({
    name: 'npm.downloads',
    method: async function () {

        const result = await Utils.download('https://api.npmjs.org/downloads/point/last-month/hapi', { json: true, rejectUnauthorized: false });
        return result && result.downloads && String(result.downloads).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'npm.downloads'
    }
});
