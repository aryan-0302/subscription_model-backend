import Joi from "joi";


const createSubscriptionSchema = Joi.object({
    planId: Joi.string().required().messages({
      'string.empty': 'Plan ID is required',
      'any.required': 'Plan ID is required'
    }),
    autoRenew: Joi.boolean().default(false)
  });
  
  const updateSubscriptionSchema = Joi.object({
    planId: Joi.string().required().messages({
      'string.empty': 'Plan ID is required',
      'any.required': 'Plan ID is required'
    }),
    autoRenew: Joi.boolean()
  });
  
  const validateCreateSubscription = (req, res, next) => {
    const { error } = createSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
  
  const validateUpdateSubscription = (req, res, next) => {
    const { error } = updateSubscriptionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
  
export {validateCreateSubscription,validateUpdateSubscription}