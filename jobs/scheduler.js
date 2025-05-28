import { subscriptionQueue } from '../config/bullqueue.js';

async function scheduleExpireSubscriptionsJob() {
  await subscriptionQueue.add(
    'expireSubscriptions',
    {},
    {
      repeat: { cron: '0 * * * *' }
    }
  );
  console.log('Scheduled expireSubscriptions job to run every hour');
}

export default scheduleExpireSubscriptionsJob;
