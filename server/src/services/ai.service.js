import { generateContent, generateContentFromImage } from '../config/gemini.js';

/**
 * AI Service — all Gemini-powered features
 */

// ─── Disease Detection ───────────────────────────────────────────────
export const detectDisease = async (imageBuffer, mimeType = 'image/jpeg') => {
  const prompt = `You are an expert plant pathologist AI. Analyze this plant/leaf image and provide a detailed disease diagnosis.

Return your response as a valid JSON object with exactly this structure (no markdown, no code fences, just raw JSON):
{
  "isHealthy": false,
  "disease": {
    "name": "Disease name or 'Healthy'",
    "confidence": 85,
    "severity": "low|medium|high|critical",
    "description": "Detailed description of the disease"
  },
  "healthScore": 65,
  "symptoms": ["symptom1", "symptom2", "symptom3"],
  "causes": ["cause1", "cause2"],
  "treatments": {
    "organic": ["organic treatment 1", "organic treatment 2"],
    "chemical": ["chemical treatment 1", "chemical treatment 2"],
    "homeRemedies": ["home remedy 1", "home remedy 2"]
  },
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "recoveryTime": "1-2 weeks",
  "dosAndDonts": {
    "dos": ["do1", "do2"],
    "donts": ["dont1", "dont2"]
  },
  "estimatedCost": "$5-15 for treatment supplies"
}

If the plant looks healthy, set isHealthy to true, disease.name to "Healthy", confidence to the confidence level, severity to "none", healthScore to 90-100, and provide general care tips in treatments.

Be specific, practical, and accurate. Provide at least 3 items for symptoms, treatments, and prevention.`;

  try {
    const response = await generateContentFromImage(prompt, imageBuffer, mimeType);
    if (!response) return getMockDiseaseResult();

    // Parse JSON from response (strip any markdown fences if present)
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI Disease Detection Error:', error.message);
    return getMockDiseaseResult();
  }
};

// ─── Treatment Recommendations ───────────────────────────────────────
export const getTreatment = async (diseaseName, plantType = '') => {
  const prompt = `You are an expert plant care advisor. Provide detailed treatment recommendations for "${diseaseName}" ${plantType ? `affecting a ${plantType} plant` : ''}.

Return as valid JSON (no markdown fences):
{
  "disease": "${diseaseName}",
  "organic": [
    { "name": "Treatment name", "description": "How to apply", "effectiveness": "high|medium|low" }
  ],
  "chemical": [
    { "name": "Product name", "description": "How to apply", "precautions": "Safety notes" }
  ],
  "homeRemedies": [
    { "name": "Remedy name", "description": "How to prepare and apply" }
  ],
  "preventiveMeasures": ["measure1", "measure2"],
  "recoveryTimeline": [
    { "week": 1, "description": "What to expect in week 1" },
    { "week": 2, "description": "What to expect in week 2" }
  ],
  "dos": ["do1", "do2", "do3"],
  "donts": ["dont1", "dont2", "dont3"],
  "estimatedCost": "$10-25"
}

Provide at least 3 items for each treatment category.`;

  try {
    const response = await generateContent(prompt);
    if (!response) return getMockTreatment(diseaseName);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI Treatment Error:', error.message);
    return getMockTreatment(diseaseName);
  }
};

// ─── Fertilizer Recommendation ───────────────────────────────────────
export const getFertilizerRecommendation = async (plantType, disease = '', age = '', season = '', soil = '') => {
  const prompt = `You are an expert agronomist. Recommend fertilizers for a ${plantType} plant.
${disease ? `The plant has: ${disease}.` : ''}
${age ? `Plant age: ${age}.` : ''}
${season ? `Current season: ${season}.` : ''}
${soil ? `Soil type: ${soil}.` : ''}

Return as valid JSON (no markdown fences):
{
  "plantType": "${plantType}",
  "organic": [
    { "name": "Fertilizer name", "npkRatio": "10-10-10", "dosage": "amount", "frequency": "how often", "applicationMethod": "how to apply" }
  ],
  "chemical": [
    { "name": "Fertilizer name", "npkRatio": "20-20-20", "dosage": "amount", "frequency": "how often", "applicationMethod": "how to apply" }
  ],
  "schedule": [
    { "month": "January", "action": "What to apply" }
  ],
  "tips": ["tip1", "tip2", "tip3"],
  "warnings": ["warning1"]
}`;

  try {
    const response = await generateContent(prompt);
    if (!response) return getMockFertilizer(plantType);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI Fertilizer Error:', error.message);
    return getMockFertilizer(plantType);
  }
};

// ─── Water Schedule ──────────────────────────────────────────────────
export const getWaterSchedule = async (plantType, location = '', season = '') => {
  const prompt = `You are a plant care expert. Generate a smart watering schedule for a ${plantType} plant.
${location ? `Location: ${location}.` : ''}
${season ? `Season: ${season}.` : ''}

Return as valid JSON (no markdown fences):
{
  "plantType": "${plantType}",
  "frequency": "Every X days",
  "amount": "Xml per watering",
  "bestTime": "Morning/Evening",
  "weeklySchedule": [
    { "day": "Monday", "water": true, "amount": "200ml", "notes": "Regular watering" },
    { "day": "Tuesday", "water": false, "amount": "0ml", "notes": "Rest day" }
  ],
  "seasonalAdjustments": {
    "summer": "Increase frequency to daily",
    "winter": "Reduce to twice a week",
    "rainy": "Skip watering on rainy days"
  },
  "signs": {
    "overwatering": ["sign1", "sign2"],
    "underwatering": ["sign1", "sign2"]
  },
  "tips": ["tip1", "tip2", "tip3"]
}`;

  try {
    const response = await generateContent(prompt);
    if (!response) return getMockWaterSchedule(plantType);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI Water Schedule Error:', error.message);
    return getMockWaterSchedule(plantType);
  }
};

// ─── Chatbot ─────────────────────────────────────────────────────────
export const chat = async (message, history = [], imageBuffer = null, mimeType = 'image/jpeg', weatherStr = null) => {
  const systemPrompt = `You are PlantSense AI, a friendly and knowledgeable plant care assistant. You help users with:
- Plant disease identification and treatment
- Watering and fertilizer advice
- General plant care tips
- Growing guides

IMPORTANT TOMATO MVP CONTEXT:
This application focuses on TOMATO plants. Whenever the user asks general questions (e.g. "my leaves are yellowing", "when should I water?"), assume they are talking about TOMATO plants unless they specify otherwise. Provide practical, farmer-friendly guidance and specifically outline possible causes (disease/nutrients/watering). Do not fabricate disease findings that haven't been provided to you!
${weatherStr ? `\nCURRENT WEATHER CONTEXT: ${weatherStr}\nUse this real-time weather information carefully to evaluate watering advice.` : ''}

IMPORTANT: You support conversations in both English and Tamil. Interpret and reply in the same language the user uses.

Keep responses concise, practical, and friendly. Use emojis occasionally. If the user sends an image, analyze it for plant health.`;

  const formattedHistory = history
    .slice(-10) // Keep last 10 messages for context
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const fullPrompt = `${systemPrompt}\n\nConversation history:\n${formattedHistory}\n\nUser: ${message}\n\nAssistant:`;

  try {
    let response;
    if (imageBuffer) {
      response = await generateContentFromImage(fullPrompt, imageBuffer, mimeType);
    } else {
      response = await generateContent(fullPrompt);
    }
    return response;
  } catch (error) {
    console.error('AI Chat Error:', error.message);
    throw new Error(`AI Service Error: ${error.message}`);
  }
};

// ─── Mock Data (fallbacks when API key is missing) ───────────────────
function getMockDiseaseResult() {
  return {
    isHealthy: false,
    disease: {
      name: 'Leaf Blight',
      confidence: 87,
      severity: 'medium',
      description: 'Leaf blight is a common fungal disease that causes brown or black lesions on leaves. It spreads rapidly in warm, humid conditions.',
    },
    healthScore: 62,
    symptoms: ['Brown or black spots on leaves', 'Yellowing around lesions', 'Wilting leaf edges', 'Premature leaf drop'],
    causes: ['Fungal pathogens (Alternaria, Phytophthora)', 'High humidity and poor air circulation', 'Overwatering or waterlogged soil'],
    treatments: {
      organic: ['Apply neem oil spray (2ml per liter water)', 'Use copper-based fungicide', 'Remove and destroy affected leaves'],
      chemical: ['Apply Mancozeb fungicide as directed', 'Use Chlorothalonil spray every 7-10 days', 'Systemic fungicide for severe cases'],
      homeRemedies: ['Baking soda solution (1 tsp per liter)', 'Milk spray (40% milk, 60% water)', 'Garlic extract spray'],
    },
    prevention: ['Ensure proper spacing for air circulation', 'Water at the base, avoid wetting leaves', 'Remove fallen debris regularly', 'Rotate crops annually'],
    recoveryTime: '2-3 weeks with proper treatment',
    dosAndDonts: {
      dos: ['Isolate affected plants', 'Prune damaged parts with sterile tools', 'Improve drainage'],
      donts: ['Don\'t overhead water', 'Don\'t compost infected material', 'Don\'t ignore early symptoms'],
    },
    estimatedCost: '$8-20 for treatment supplies',
  };
}

function getMockTreatment(disease) {
  return {
    disease,
    organic: [
      { name: 'Neem Oil Spray', description: 'Mix 2ml neem oil per liter of water. Spray on affected areas every 5-7 days.', effectiveness: 'high' },
      { name: 'Copper Fungicide', description: 'Apply copper-based organic fungicide early morning. Repeat weekly.', effectiveness: 'high' },
      { name: 'Compost Tea', description: 'Brew compost tea for 24-48 hours. Spray as foliar application.', effectiveness: 'medium' },
    ],
    chemical: [
      { name: 'Mancozeb 75% WP', description: 'Mix 2g per liter water. Spray at 10-day intervals.', precautions: 'Wear gloves and mask. Keep away from edible parts.' },
      { name: 'Chlorothalonil', description: 'Apply as preventive spray every 7-14 days.', precautions: 'Do not apply in direct sunlight.' },
    ],
    homeRemedies: [
      { name: 'Baking Soda Solution', description: 'Mix 1 tsp baking soda + few drops dish soap in 1L water. Spray weekly.' },
      { name: 'Apple Cider Vinegar', description: 'Mix 3 tbsp ACV per gallon of water. Spray in morning.' },
    ],
    preventiveMeasures: ['Ensure good air circulation', 'Water at soil level', 'Remove infected debris', 'Use disease-resistant varieties'],
    recoveryTimeline: [
      { week: 1, description: 'Symptoms may still appear but spreading should slow.' },
      { week: 2, description: 'New growth should appear healthy. Continue treatment.' },
      { week: 3, description: 'Plant should show significant recovery.' },
    ],
    dos: ['Act quickly at first signs', 'Sterilize pruning tools', 'Maintain consistent watering'],
    donts: ['Don\'t over-fertilize', 'Don\'t ignore recurring symptoms', 'Don\'t water leaves from above'],
    estimatedCost: '$10-25',
  };
}

function getMockFertilizer(plantType) {
  return {
    plantType,
    organic: [
      { name: 'Vermicompost', npkRatio: '2-1-1', dosage: '500g per plant', frequency: 'Every 2 weeks', applicationMethod: 'Mix into top soil layer' },
      { name: 'Bone Meal', npkRatio: '3-15-0', dosage: '2 tbsp per plant', frequency: 'Monthly', applicationMethod: 'Work into soil around base' },
    ],
    chemical: [
      { name: 'NPK 20-20-20', npkRatio: '20-20-20', dosage: '1g per liter water', frequency: 'Every 2 weeks', applicationMethod: 'Dissolve in water and apply to soil' },
    ],
    schedule: [
      { month: 'Spring', action: 'Apply balanced NPK fertilizer' },
      { month: 'Summer', action: 'Light feeding with organic compost' },
      { month: 'Autumn', action: 'Reduce fertilization' },
      { month: 'Winter', action: 'Stop fertilizing' },
    ],
    tips: ['Always water before fertilizing', 'Don\'t fertilize stressed plants', 'Follow label instructions carefully'],
    warnings: ['Over-fertilizing can burn roots'],
  };
}

function getMockWaterSchedule(plantType) {
  return {
    plantType,
    frequency: 'Every 2-3 days',
    amount: '200-300ml per watering',
    bestTime: 'Early morning (6-8 AM)',
    weeklySchedule: [
      { day: 'Monday', water: true, amount: '250ml', notes: 'Regular watering' },
      { day: 'Tuesday', water: false, amount: '0ml', notes: 'Rest day' },
      { day: 'Wednesday', water: true, amount: '250ml', notes: 'Check soil moisture first' },
      { day: 'Thursday', water: false, amount: '0ml', notes: 'Rest day' },
      { day: 'Friday', water: true, amount: '250ml', notes: 'Regular watering' },
      { day: 'Saturday', water: false, amount: '0ml', notes: 'Rest day' },
      { day: 'Sunday', water: true, amount: '200ml', notes: 'Light watering' },
    ],
    seasonalAdjustments: {
      summer: 'Increase to daily watering',
      winter: 'Reduce to twice per week',
      rainy: 'Skip watering on rainy days',
    },
    signs: {
      overwatering: ['Yellowing lower leaves', 'Mushy stems', 'Fungus gnats'],
      underwatering: ['Dry, crispy leaf edges', 'Wilting', 'Slow growth'],
    },
    tips: ['Check soil moisture before watering', 'Use room-temperature water', 'Ensure proper drainage'],
  };
}

export default { detectDisease, getTreatment, getFertilizerRecommendation, getWaterSchedule, chat };
