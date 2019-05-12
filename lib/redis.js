'use strict';

const Redis = require('redis');
const { promisify } = require('util');
const Config = require('getconfig');
const debug = require('debug')('redisClient');
const Utils = require('./utils');
const Querystring = require('querystring');
const Bourne = require('@hapi/bourne');

const clientKey = Symbol('redisClient');
const setAsync = Symbol('setAsync');
const getAsync = Symbol('getAsync');
const perPage = Symbol('perPage');
const requestOptions = Symbol('requestOptions');
const getValue = Symbol('getValue');

const MILESTONES_KEY = 'milestones';

module.exports = class RedisClient {

    constructor() {

        this[perPage] = 100;
        this[requestOptions] = {
            headers: {
                'user-agent': 'hapijs.com',
                'authorization': 'token ' + Config.githubToken
            },
            json: true
        };

        this[clientKey] = Redis.createClient(Config.redis);
        this[setAsync] = promisify(this[clientKey].set).bind(this[clientKey]);
        this[getAsync] = promisify(this[clientKey].get).bind(this[clientKey]);
    }

    async [getValue](key) {

        const serializedValue = await this[getAsync](key);
        const value = Bourne.parse(serializedValue, null, 'remove');
        return value;
    }

    async cacheMilestones() {

        debug('fetch milestones');
        const params = Querystring.encode({
            state: 'closed',
            per_page: this[perPage]
        });

        const milestones = await Utils.downloadAllPages(`https://api.github.com/repos/hapijs/hapi/milestones?${params}`, this[perPage], this[requestOptions]);

        await this[setAsync](MILESTONES_KEY, JSON.stringify(milestones));
    }

    /**
     * @returns Promise
     */
    getMilestones() {

        debug('get milestones');

        return this[getValue](MILESTONES_KEY);
    }
};
