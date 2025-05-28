import { subscriptionQueue } from './config/bullqueue.js';  // adjust path if needed

async function addExpireJob() {
  await subscriptionQueue.add('expireSubscriptions', {});
  console.log('Expire subscriptions job added to queue');
  process.exit(0);
}

addExpireJob();
