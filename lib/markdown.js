var Config = require('getconfig');
var Crypto = require('crypto');
var Utils = require('./utils');
var Wreck = require('wreck');

exports.methods = [];

exports.methods.push({
    name: 'markdown.parse',
    method: function (str, callback) {

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

            callback(null, body);
        });
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear
        },
        generateKey: function (str) {

            var hash = Crypto.createHash('sha1').update(str).digest('hex');
            return hash;
        }
    }
});
