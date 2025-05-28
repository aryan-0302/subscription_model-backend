import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import SubscriptionService from '../services/subscriptionService.js';

const connection = new IORedis({
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  'subscriptionQueue',
  async (job) => {
    if (job.name === 'expireSubscriptions') {
      console.log('Running expireSubscriptions job...');
      const expiredCount = await SubscriptionService.expireSubscriptions();
      console.log(`Expired ${expiredCount} subscriptions.`);
      return expiredCount;
    }
    throw new Error(`Unknown job: ${job.name}`);
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

export default worker