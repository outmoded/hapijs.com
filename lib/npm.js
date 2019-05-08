'use strict';

const Utils =  require('./utils');

exports.methods = [];

exports.methods.push({
    name: 'npm.package',
    method: async (packageName) => {

        const result = await Utils.download(`https://registry.npmjs.org/${packageName}`, { json: true, rejectUnauthorized: false });
        if (!result || result.name !== packageName) {
            throw new Error(`failed to fetch package ${packageName}`);
        }
        return result;
    },
    options: {
        cache: {
            dropOnError: false,
            expiresIn: Utils.oneDay,
            staleIn: Utils.fifteenMinutes,
            staleTimeout: Utils.fiveSeconds,
            generateTimeout: Utils.oneMinute
        }
    }
});

exports.methods.push({
    name: 'npm.version',
    method: async () => {

        const result = await Utils.download('https://registry.npmjs.org/@hapi/hapi', { json: true, rejectUnauthorized: false });
        return result && result['dist-tags'] && result.versions && result['dist-tags'].latest && result.versions[result['dist-tags'].latest];
    },
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
    method: async (req) => {

        const result = await req.server.methods.npm.package('@hapi/hapi');

        try {
            const resultLegacy = await req.server.methods.npm.package('hapi');
            result.versions = Object.assign(resultLegacy.versions, result.versions);
        }
        catch (error) {
            req.log(['error'], { msg: 'failed to fetch legacy package info from npm', error });
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
