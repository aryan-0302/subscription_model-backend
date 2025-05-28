import Plan from "../models/Plan.js";
import redisClient from "../config/redisClient.js";

class PlanService {
  async getAllPlans() {
    const cacheKey = "all_plans";

    const cachedPlans = await redisClient.get(cacheKey);
    if (cachedPlans) {
      console.log("Fetched plans from Redis");
      return JSON.parse(cachedPlans);
    }

    const plans = await Plan.find({ isActive: true }).select("-__v");

    await redisClient.set(cacheKey, JSON.stringify(plans), { EX: 60 });

    console.log("Fetched plans from DB and cached");
    return plans;
  }

  async createPlan(planData) {
    const plan = new Plan(planData);
    await plan.save();

    await redisClient.del("all_plans");

    return plan;
  }

  async getPlanById(planId) {
    const plan = await Plan.findById(planId);
    if (!plan) {
      throw new Error("Plan not found");
    }
    return plan;
  }
}

export default new PlanService();
