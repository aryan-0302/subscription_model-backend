import Subscription from "../models/Subscription.js";
import Plan from "../models/Plan.js";
import redisClient from "../config/redisClient.js";
import retry from "async-retry";

class SubscriptionService {
  async createSubscription(userId, planId, autoRenew = false) {
    const existingSubscription = await retry(async () =>
      Subscription.findOne({
        userId,
        status: { $in: ["ACTIVE", "INACTIVE"] },
      }), {
        retries: 3,
        factor: 2,
      });

    if (existingSubscription) {
      throw new Error("User already has an active subscription");
    }

    const plan = await retry(async () => Plan.findById(planId), {
      retries: 3,
    });

    if (!plan || !plan.isActive) {
      throw new Error("Invalid or inactive plan");
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 1 * 60 * 1000);

    const subscription = new Subscription({
      userId,
      planId,
      startDate,
      endDate,
      autoRenew,
      status: "ACTIVE",
    });

    await retry(async () => subscription.save(), {
      retries: 3,
    });

    await retry(async () => redisClient.del(`subscription:userId:${userId}`), {
      retries: 3,
    });

    return await this.getSubscriptionDetails(subscription._id);
  }

  async getSubscriptionByUserId(userId) {
    const cacheKey = `subscription:userId:${userId}`;

    const cached = await retry(async () => redisClient.get(cacheKey), {
      retries: 2,
    });

    if (cached) {
      return JSON.parse(cached);
    }

    const subscription = await retry(async () =>
      Subscription.findOne({ userId })
        .populate("planId", "name price features duration")
        .populate("userId", "name email"), {
        retries: 3,
      });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    await retry(async () =>
      redisClient.set(cacheKey, JSON.stringify(subscription), {
        EX: 3600,
      }), {
      retries: 3,
    });

    return subscription;
  }

  async updateSubscription(userId, planId, autoRenew) {
    const subscription = await retry(async () =>
      Subscription.findOne({ userId }), {
        retries: 3,
      });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status === "CANCELLED" || subscription.status === "EXPIRED") {
      throw new Error("Cannot update cancelled or expired subscription");
    }

    const plan = await retry(async () => Plan.findById(planId), {
      retries: 3,
    });

    if (!plan || !plan.isActive) {
      throw new Error("Invalid or inactive plan");
    }

    subscription.planId = planId;
    if (autoRenew !== undefined) {
      subscription.autoRenew = autoRenew;
    }

    const now = new Date();
    const remainingTime = subscription.endDate - now;
    if (remainingTime > 0) {
      subscription.endDate = new Date(now.getTime() + plan.duration * 24 * 60 * 60 * 1000);
    }

    await retry(async () => subscription.save(), {
      retries: 3,
    });

    await retry(async () => redisClient.del(`subscription:userId:${userId}`), {
      retries: 3,
    });

    return await this.getSubscriptionDetails(subscription._id);
  }

  async cancelSubscription(userId) {
    const subscription = await retry(async () =>
      Subscription.findOne({ userId }), {
        retries: 3,
      });

    if (!subscription) {
      throw new Error("Subscription not found");
    }

    if (subscription.status === "CANCELLED") {
      throw new Error("Subscription is already cancelled");
    }

    subscription.status = "CANCELLED";
    subscription.autoRenew = false;

    await retry(async () => subscription.save(), {
      retries: 3,
    });

    await retry(async () => redisClient.del(`subscription:userId:${userId}`), {
      retries: 3,
    });

    return await this.getSubscriptionDetails(subscription._id);
  }

  async getSubscriptionDetails(subscriptionId) {
    return await retry(async () =>
      Subscription.findById(subscriptionId)
        .populate("planId", "name price features duration")
        .populate("userId", "name email"), {
      retries: 3,
    });
  }

  async expireSubscriptions() {
    const now = new Date();

    const result = await retry(async () =>
      Subscription.updateMany(
        {
          endDate: { $lt: now },
          status: "ACTIVE",
        },
        {
          status: "EXPIRED",
        }
      ), {
        retries: 3,
      });

    return result.modifiedCount;
  }
}

export default new SubscriptionService();
