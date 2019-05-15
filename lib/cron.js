'use strict';

const RedisClient = require('./redis');

exports.fetchGithubData = async () => {

    const redisClient = new RedisClient();
    await Promise.all([
        redisClient.cacheMilestones(),
        redisClient.cacheGitHubCommits(),
        redisClient.cacheGitHubIssues(),
        redisClient.cacheGitHubPullRequests(),
        redisClient.cacheNpmPackages()
    ]);
};
