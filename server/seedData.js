import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './src/config/database.js';
import User from './src/models/User.js';
import Plant from './src/models/Plant.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Connected to DB for seeding. Clearing existing data...');

    await User.deleteMany({});
    await Plant.deleteMany({});

    console.log('Inserting mock user...');
    const user = await User.create({
      name: 'Mock User',
      email: 'mockuser@example.com',
      password: 'password123',
      role: 'user',
      isVerified: true
    });

    console.log('Inserting mock plants...');
    const plants = await Plant.insertMany([
      {
        user: user._id,
        name: 'Tomato Plant 1',
        category: 'Vegetables',
        type: 'Tomato',
        age: { value: 2, unit: 'months' },
        location: 'Garden Bed A',
        healthScore: 85,
        status: 'healthy',
        waterSchedule: { frequency: 'Every 2 days', amount: '200ml' }
      },
      {
        user: user._id,
        name: 'Tomato Plant 2',
        category: 'Vegetables',
        type: 'Tomato',
        age: { value: 1, unit: 'months' },
        location: 'Patio',
        healthScore: 60,
        status: 'diseased',
        diseases: [{ name: 'Early Blight', severity: 'medium' }]
      }
    ]);

    user.plantsCount = plants.length;
    await user.save();

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
