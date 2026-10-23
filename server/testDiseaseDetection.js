import dotenv from 'dotenv';
dotenv.config();

import { detectDisease } from './src/services/ai.service.js';

async function testScan() {
  console.log('🔬 Testing Plant Disease Detection AI...');
  
  // Create a 1x1 green test image buffer (PNG)
  const testPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(testPngBase64, 'base64');
  
  try {
    const result = await detectDisease(buffer, 'image/png');
    console.log('\n✅ AI Detection Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result && result.disease) {
      console.log('\n🎉 Test Passed! Model diagnosed:', result.disease.name || 'Healthy');
    }
  } catch (err) {
    console.error('❌ Detection failed:', err);
  }
}

testScan();
