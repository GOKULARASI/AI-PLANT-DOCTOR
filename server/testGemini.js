import dotenv from 'dotenv';
dotenv.config();

import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

async function testGemini() {
  let log = '';
  
  if (!process.env.GEMINI_API_KEY) {
    fs.writeFileSync('out.txt', 'No API key found in .env', 'utf-8');
    return;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    const result = await model.generateContent('Say hello world');
    log += 'Gemini 2.5 reply: ' + result.response.text();
  } catch (err) {
    log += 'Error 2.5: ' + err.message + '\n';
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const fallbackResult = await fallbackModel.generateContent('Say hello world');
      log += '\nFallback 1.5 reply: ' + fallbackResult.response.text();
    } catch (fallbackErr) {
      log += '\nFallback 1.5 failed too: ' + fallbackErr.message;
    }
  }
  fs.writeFileSync('out.txt', log, 'utf-8');
}

testGemini();
