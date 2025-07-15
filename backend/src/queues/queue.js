const { Queue, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');

const connectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null,
};

const connection = new IORedis(connectionOptions);

const mlQueue = new Queue('mlQueue', { connection });
const mlQueueEvents = new QueueEvents('mlQueue', { connection });

module.exports = { mlQueue, mlQueueEvents };
