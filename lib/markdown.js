var Config = require('getconfig');
var Crypto = require('crypto');
var Wreck = require('wreck');

var internals = {};
internals.cache = {};

exports.parse = function (str, callback) {

    var hash = Crypto.createHash('sha1').update(str).digest('hex');
    if (internals.cache[hash]) {
        return callback(null, internals.cache[hash]);
    }

    Wreck.post('https://api.github.com/markdown/raw', {
        payload: str,
        headers: {
            'content-type': 'text/plain',
            'user-agent': 'hapijs.com',
            authorization: 'token ' + Config.githubToken
        }
    }, function (err, res, body) {

        if (err) {
            return callback(err);
        }

        internals.cache[hash] = body;
        callback(null, body);
    });
};
