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
            return callback(err || new Error('ERROR: Failed to download, got statusCode: ' +  res.statusCode));
        }

        callback(null, payload);
    });
};
