import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let model = null;

/**
 * Initialize Gemini AI client
 */
export const initGemini = () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️ GEMINI_API_KEY not set. AI features will use mock data.');
    return null;
  }
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
  console.log('✅ Gemini AI initialized');
  return model;
};

/**
 * Get the Gemini model instance
 */
export const getModel = () => {
  if (!model) {
    initGemini();
  }
  return model;
};

/**
 * Generate content from text prompt
 */
export const generateContent = async (prompt) => {
  const m = getModel();
  if (!m) return null;
  const result = await m.generateContent(prompt);
  return result.response.text();
};

/**
 * Generate content from image + text prompt
 */
export const generateContentFromImage = async (prompt, imageBuffer, mimeType = 'image/jpeg') => {
  const m = getModel();
  if (!m) return null;

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  const result = await m.generateContent([prompt, imagePart]);
  return result.response.text();
};

/**
 * Generate content from multiple images + text prompt (e.g. Before vs After comparison)
 */
export const generateContentFromImages = async (prompt, imageParts) => {
  const m = getModel();
  if (!m) return null;

  const parts = imageParts.map(({ buffer, mimeType = 'image/jpeg' }) => ({
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  }));

  const result = await m.generateContent([prompt, ...parts]);
  return result.response.text();
};

export default { initGemini, getModel, generateContent, generateContentFromImage, generateContentFromImages };
