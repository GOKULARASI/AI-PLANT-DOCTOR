import dotenv from 'dotenv';
dotenv.config();

import { chat } from './src/services/ai.service.js';

async function test() {
  try {
    console.log('Testing Chatbot API...');
    
    console.log('\n--- 1. Hello ---');
    const r1 = await chat('Hello');
    console.log(r1);

    console.log('\n--- 2. Tomato Leaves ---');
    const r2 = await chat('Why are my tomato leaves turning yellow?');
    console.log(r2);

    console.log('\n--- 3. Watering ---');
    const r3 = await chat('Should I water my tomato plant today?', [], null, 'image/jpeg', 'Temp: 35C, Humidity: 20%, Rain Chance: 0%');
    console.log(r3);
    
    console.log('\n--- 4. Tamil ---');
    const r4 = await chat('வணக்கம்');
    console.log(r4);

  } catch (error) {
    console.error('Test Failed:', error);
  }
}

test();
