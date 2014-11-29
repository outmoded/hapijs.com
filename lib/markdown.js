var Config = require('getconfig');
var Crypto = require('crypto');
var Request = require('sync-request');

var internals = {};
internals.cache = {};

exports.parseSync = function (str) {

    var hash = Crypto.createHash('sha1').update(str).digest('hex');

    if (!internals.cache.hasOwnProperty(hash)) {
        var response = Request('POST', 'https://api.github.com/markdown/raw', {
            body: str,
            headers: {
                'content-type': 'text/plain',
                'user-agent': 'hapijs.com',
                authorization: 'token ' + Config.githubToken
            }
        });

        internals.cache[hash] = response.getBody('utf8');
    }

    return internals.cache[hash];
};
