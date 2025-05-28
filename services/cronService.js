import subscriptionService from "./subscriptionService.js"

const expiredSubscriptionChecker = async () => {
    try {
      console.log('Running expired subscription checker...');
      const expiredCount = await subscriptionService.expireSubscriptions();
      console.log(`Expired ${expiredCount} subscriptions`);
    } catch (error) {
      console.error('Error in expired subscription checker:', error);
    }
  };

  export {expiredSubscriptionChecker}