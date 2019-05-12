'use strict';

const RedisClient = require('./redis');

exports.fetchGithubData = async () => {

    // TODO: handle case where we go beyond github rate limit
    const redisClient = new RedisClient();
    await Promise.all([redisClient.cacheMilestones()]);
};
