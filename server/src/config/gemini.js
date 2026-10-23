import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite'
];

/**
 * Initialize Gemini AI client
 */
export const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set. AI features will use mock data.');
    return null;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini AI initialized');
  return genAI;
};

/**
 * Helper to run generateContent with fallback across models
 */
const runWithFallback = async (runner) => {
  if (!genAI) {
    initGemini();
  }
  if (!genAI) return null;

  let lastError = null;
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await runner(model);
      return result;
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ Model ${modelName} encountered error: ${err.message}. Trying next candidate...`);
    }
  }
  throw lastError;
};

/**
 * Generate content from text prompt
 */
export const generateContent = async (prompt) => {
  return runWithFallback(async (model) => {
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
};

/**
 * Generate content from image + text prompt
 */
export const generateContentFromImage = async (prompt, imageBuffer, mimeType = 'image/jpeg') => {
  return runWithFallback(async (model) => {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType,
      },
    };
    const result = await model.generateContent([prompt, imagePart]);
    return result.response.text();
  });
};

/**
 * Generate content from multiple images + text prompt (e.g. Before vs After comparison)
 */
export const generateContentFromImages = async (prompt, imageParts) => {
  return runWithFallback(async (model) => {
    const parts = imageParts.map(({ buffer, mimeType = 'image/jpeg' }) => ({
      inlineData: {
        data: buffer.toString('base64'),
        mimeType,
      },
    }));
    const result = await model.generateContent([prompt, ...parts]);
    return result.response.text();
  });
};

export default { initGemini, generateContent, generateContentFromImage, generateContentFromImages };

