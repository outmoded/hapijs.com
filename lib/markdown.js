'use strict';

const Config = require('getconfig');
const Crypto = require('crypto');
const Utils = require('./utils');
const Wreck = require('wreck');


exports.methods = [];


exports.methods.push({
    name: 'markdown.parse',
    method: async function (str) {

        const { payload } = await Wreck.post('https://api.github.com/markdown/raw', {
            payload: str,
            headers: {
                'content-type': 'text/plain',
                'user-agent': 'hapijs.com',
                authorization: `token ${Config.githubToken}`
            }
        });
        // console.log('payload', payload);
        return payload.toString();
    },
    options: {
        cache: {
            expiresIn: Utils.oneYear,
            generateTimeout: Utils.oneMinute
        },
        generateKey: function (str) {

            const hash = Crypto.createHash('sha1').update(str).digest('hex');
            return hash;
        }
    }
});
