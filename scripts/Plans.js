import mongoose from "mongoose"
import Plan from "../models/Plan.js"
require('dotenv').config();

const samplePlans = [
  {
    name: 'Basic',
    price: 9.99,
    features: ['10 Users', '5GB Storage', 'Email Support'],
    duration: 30
  },
  {
    name: 'Pro',
    price: 29.99,
    features: ['50 Users', '50GB Storage', 'Priority Support', 'Advanced Analytics'],
    duration: 30
  },
  {
    name: 'Enterprise',
    price: 99.99,
    features: ['Unlimited Users', '500GB Storage', '24/7 Support', 'Custom Integration', 'SLA'],
    duration: 30
  }
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await Plan.deleteMany({});
    await Plan.insertMany(samplePlans);
    
    console.log('Plans seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();
