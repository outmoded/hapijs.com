'use strict';

const { CronJob } = require('cron');
const debug = require('debug')('cron');
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
    await redisClient.destroy();
};

// we perform a first cache warmup at server startup
exports.fetchGithubData().catch(debug);

// refresh redis cache every 30min
const job = new CronJob('0 */30 * * * *', exports.fetchGithubData);
job.start();

exports.fetchDataJob = job;
