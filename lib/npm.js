var Utils = require('./utils');

exports.downloads = function (callback) {

    return Utils.download('https://api.npmjs.org/downloads/point/last-month/hapi', { json: true, rejectUnauthorized: false }, callback);
};
