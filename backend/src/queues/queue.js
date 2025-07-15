const { Queue, QueueEvents } = require('bullmq');
const IORedis = require('ioredis');

// Define the connection options in one place
const redisOptions = {
  host: process.env.REDIS_HOST || 'redis',
  port: process.env.REDIS_PORT || 6379,
  maxRetriesPerRequest: null, 
};

const queueConnection = new IORedis(redisOptions);

const eventsConnection = new IORedis(redisOptions);

const mlQueue = new Queue('mlQueue', {
  connection: queueConnection,
});

const mlQueueEvents = new QueueEvents('mlQueue', {
  connection: eventsConnection,
});

// Export both so they can be used where needed
module.exports = {
  mlQueue,
  mlQueueEvents,
};