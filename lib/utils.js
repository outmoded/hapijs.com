'use strict';

const debug = require('debug')('utils');
const debugAll = require('debug')('download:all');
const debugError = require('debug')('utils:error');
const DoWhile = require('p-do-whilst');
const Wreck = require('wreck');

exports.download = async function (url, options) {

    debug('download', url);
    try {
        const { res, payload } = await Wreck.get(url, options);
        if (/vnd\.github/.test(res.headers['content-type'])) {
            const pstring = payload.toString();
            return pstring;
        }
        return payload;
    }
    catch (e) {
        debugError('Error Downloading', e);
        debugError('URL that failed', url);
        return null;
    }
};


exports.downloadAllPages = async function (url, perPage, options) {

    debugAll(url);
    let page = 1;
    let result = [];
    let lastSize;
    const maxLoop = 5;
    const fn = async function () {

        debugAll('fn download', url);
        debugAll('fn download page', page);
        try {
            const { payload } = await Wreck.get(`${url}&page=${page}`, options);
            result = result.concat(payload);
            debug('payloadLength', payload.length);
            lastSize = payload.length;
            page++;
            return null;
        }
        catch (e) {
            debugError('error', e.message);
            debugError('url that failed', url);
            lastSize = 0;
            return null;
        }
    };

    const test = () => {

        debugAll('last size', lastSize);
        debugAll('per page', perPage);
        if (page === maxLoop) {
            debugAll('page is at max');
            return false;
        }
        return  lastSize === perPage;
    };

    await DoWhile(fn, test);
    debug('return download all now', url);
    return result;
};

exports.oneMinute = 60000;
exports.fifteenMinutes = 900000;
exports.oneHour = 3600000;
exports.oneDay = 86400000;
exports.oneYear = 31556900000;
