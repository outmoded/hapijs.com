'use strict';

const Utils =  require('./utils');
const RedisClient = require('./redis');

exports.methods = [];

exports.methods.push({
    name: 'npm.package',
    method: async (packageName) => {

        const redisClient = new RedisClient();
        return await redisClient.getNpmPackage(packageName);
    }
});

exports.methods.push({
    name: 'npm.version',
    method: async (req) => {

        const result = await req.server.methods.npm.package('@hapi/hapi');
        return result && result['dist-tags'] && result.versions && result['dist-tags'].latest && result.versions[result['dist-tags'].latest];
    }
});

exports.methods.push({
    name: 'npm.versions',
    method: async (req) => {

        const result = await req.server.methods.npm.package('@hapi/hapi');
        if (!result) {
            result = { versions: {} };
        }
        const resultLegacy = await req.server.methods.npm.package('hapi');
        if (resultLegacy && resultLegacy.versions) {
            result.versions = Object.assign(resultLegacy.versions, result.versions);
        }
        return result;
    },
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

        const resultLegacy = await Utils.download('https://api.npmjs.org/downloads/point/last-month/hapi', { json: true, rejectUnauthorized: false });
        const result = await Utils.download('https://api.npmjs.org/downloads/point/last-month/@hapi/hapi', { json: true, rejectUnauthorized: false });
        const downloads = (result && result.downloads || 0) + (resultLegacy && resultLegacy.downloads || 0);

        return downloads && String(downloads).replace(/\B(?=(?:\d{3})+(?!\d))/g, ',');
    },
    options: {
        cache: {
            expiresIn: Utils.oneDay,
            generateTimeout: Utils.oneMinute
        },
        generateKey: () => 'npm.downloads'
    }
});
