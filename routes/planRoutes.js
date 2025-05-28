import express from "express"
import planService from '../services/planService.js'

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const plans = await planService.getAllPlans();
    
    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const plan = await planService.createPlan(req.body);
    
    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


export default router