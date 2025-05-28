import express from "express"
const app=express();
import dbConnect from "./config/db.js"
import dotenv from "dotenv"
dotenv.config();
import authRoutes from "./routes/authRoute.js"
import subscriptionRoutes from "./routes/subscriptionRoute.js"
import planRoutes from "./routes/planRoutes.js"
import cron from "node-cron"

import { errorHandler } from './middlewares/errorHandler.js'
import { expiredSubscriptionChecker } from "./services/cronService.js"
import helmet from "helmet"
import cors from "cors"

import healthRoutes from "./routes/health.js"


// for scalability
import rateLimit from 'express-rate-limit';
import scheduleExpireSubscriptionsJob from "./jobs/scheduler.js";
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);



const PORT = process.env.PORT || 5000;
dbConnect();

app.use(express.json());

app.use(errorHandler);

app.use("/api/health", healthRoutes);


app.use(helmet());
app.use(cors());


app.get("/", (req, res) => {
    res.status(200).json({
      message: "Welcome to the API",
    });
  });

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/plans', planRoutes);

cron.schedule('* * * * *', expiredSubscriptionChecker);

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Await inside async function — no error
  await scheduleExpireSubscriptionsJob();
}

startServer().catch(err => {
  console.error('Error starting server:', err);
});
