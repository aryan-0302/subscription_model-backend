import express from "express"
import { auth } from "../middlewares/auth.js";
import { validateCreateSubscription, validateUpdateSubscription } from '../validation/subscriptionValidation.js'
import subscriptionService from '../services/subscriptionService.js'

const router = express.Router();

router.post('/', auth, validateCreateSubscription, async (req, res) => {
  try {
    const { planId, autoRenew } = req.body;
    const subscription = await subscriptionService.createSubscription(
      req.user._id,
      planId,
      autoRenew
    );

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:userId', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const subscription = await subscriptionService.getSubscriptionByUserId(req.params.userId);
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});


router.put('/:userId', auth, validateUpdateSubscription, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { planId, autoRenew } = req.body;
    const subscription = await subscriptionService.updateSubscription(
      req.params.userId,
      planId,
      autoRenew
    );

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.delete('/:userId', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const subscription = await subscriptionService.cancelSubscription(req.params.userId);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router