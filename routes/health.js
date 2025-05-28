import express from "express";
import mongoose from "mongoose";
import redisClient from "../config/redisClient.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const mongoOk = mongoose.connection.readyState === 1;
    const redisOk = await redisClient.ping() === "PONG";

    if (mongoOk && redisOk) {
      return res.status(200).json({ status: "UP", mongo: "OK", redis: "OK" });
    } else {
      return res.status(500).json({ status: "DOWN", mongo: mongoOk, redis: redisOk });
    }
  } catch (error) {
    return res.status(500).json({ status: "DOWN", error: error.message });
  }
});

export default router;