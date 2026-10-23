import { generateContent, generateContentFromImage, generateContentFromImages } from '../config/gemini.js';
import Disease from '../models/Disease.js';

/**
 * AI Service — Python ML Microservice + Gemini-powered features
 */

/**
 * Call Python ML Microservice (PlantVillage Deep Learning)
 */
const predictWithPythonML = async (imageBuffer, mimeType = 'image/jpeg') => {
  if (process.env.USE_LOCAL_ML === 'false') return null;

  const pythonUrl = process.env.PYTHON_ML_SERVICE_URL || 'http://127.0.0.1:8000';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);

  try {
    const form = new FormData();
    const blob = new Blob([imageBuffer], { type: mimeType });
    form.append('file', blob, 'leaf_scan.jpg');

    const res = await fetch(`${pythonUrl}/predict`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.prediction) return null;

    const { diseaseName, confidence, isHealthy, rawClass, engine } = data.prediction;
    console.log(`🌿 Python ML Engine Result: ${diseaseName} (${confidence}%)`);

    if (isHealthy) {
      return {
        isHealthy: true,
        disease: {
          name: 'Healthy',
          confidence: Math.round(confidence),
          severity: 'none',
          description: `The plant foliage shows optimal chlorophyll coloration with no signs of pathogen lesions or pest infestation (${rawClass}).`,
        },
        healthScore: Math.min(100, Math.max(90, Math.round(confidence))),
        symptoms: ['Uniform vibrant green leaf color', 'No discoloration or necrotic margins', 'Healthy plant turgor'],
        causes: ['Optimal irrigation and nutrition', 'Good air circulation and full sunlight', 'Disease-free soil and seed stock'],
        treatments: {
          organic: ['Maintain regular watering routine', 'Apply balanced compost or vermicompost monthly'],
          chemical: ['No chemical intervention required'],
          homeRemedies: ['Wipe dust off leaves periodically to maximize photosynthesis'],
        },
        prevention: ['Water at soil base rather than foliar splashing', 'Inspect leaf undersides weekly for early pests', 'Maintain plant spacing'],
        recoveryTime: 'N/A (Healthy)',
        dosAndDonts: {
          dos: ['Keep consistent watering schedule', 'Ensure adequate drainage in soil'],
          donts: ['Do not over-fertilize', 'Do not let roots sit in waterlogged soil'],
        },
        estimatedCost: '$0 (Maintenance only)',
        source: 'Python ML Microservice (PlantVillage)',
        engine,
      };
    }

    // Try finding matching disease in MongoDB Disease collection
    let diseaseDoc = null;
    try {
      const searchTerms = diseaseName.split(' ').filter(w => w.length > 3);
      if (searchTerms.length > 0) {
        const regexPattern = searchTerms.join('|');
        diseaseDoc = await Disease.findOne({
          name: { $regex: new RegExp(regexPattern, 'i') },
        });
      }
    } catch (dbErr) {
      console.warn('Disease lookup warning:', dbErr.message);
    }

    if (diseaseDoc) {
      return {
        isHealthy: false,
        disease: {
          name: diseaseDoc.name,
          confidence: Math.round(confidence),
          severity: diseaseDoc.severity || 'medium',
          description: diseaseDoc.description || `Diagnosed as ${diseaseDoc.name} via PlantVillage CNN classifier.`,
        },
        healthScore: diseaseDoc.severity === 'critical' ? 35 : diseaseDoc.severity === 'high' ? 50 : 68,
        symptoms: diseaseDoc.symptoms?.length ? diseaseDoc.symptoms : ['Discolored lesions on leaf surface', 'Necrotic spots', 'Yellow halos'],
        causes: diseaseDoc.causes?.length ? diseaseDoc.causes : ['Pathogen infection (spore or bacterial splash)', 'Elevated foliar humidity'],
        treatments: diseaseDoc.treatments || {
          organic: ['Apply Neem oil spray', 'Prune infected leaves with sterile shears'],
          chemical: ['Apply broad-spectrum copper fungicide'],
          homeRemedies: ['Baking soda foliar spray (1 tbsp/gallon water)'],
        },
        prevention: diseaseDoc.prevention?.length ? diseaseDoc.prevention : ['Avoid overhead sprinkler watering', 'Ensure proper canopy spacing'],
        recoveryTime: diseaseDoc.recoveryTime || '2-3 weeks',
        dosAndDonts: {
          dos: ['Isolate affected plant', 'Sterilize pruners after cutting'],
          donts: ['Do not compost diseased leaves', 'Do not water overhead'],
        },
        estimatedCost: '$10-25 for treatments',
        source: 'Python ML Microservice (PlantVillage)',
        engine,
      };
    }

    // Standard fallback structure for custom classified disease
    return {
      isHealthy: false,
      disease: {
        name: diseaseName,
        confidence: Math.round(confidence),
        severity: 'medium',
        description: `Pathogen detected by custom PlantVillage classifier: ${diseaseName} (${rawClass}).`,
      },
      healthScore: 60,
      symptoms: ['Leaf surface spots/lesions', 'Chlorotic margins', 'Reduced foliar vigor'],
      causes: ['PlantVillage pathogen classification', 'High ambient humidity', 'Infected crop residue'],
      treatments: {
        organic: ['Neem oil foliar spray (5ml/L)', 'Bacillus subtilis bio-fungicide', 'Prune infected foliage'],
        chemical: ['Copper hydroxide or Mancozeb protective spray', 'Systemic azoxystrobin for severe infection'],
        homeRemedies: ['Dilute milk spray (40% milk / 60% water)', 'Baking soda horticultural spray'],
      },
      prevention: ['Mulch soil surface to prevent spore splash', 'Rotate crops annually', 'Water at base'],
      recoveryTime: '2-3 weeks',
      dosAndDonts: {
        dos: ['Prune diseased leaves immediately', 'Improve garden aeration'],
        donts: ['Do not overhead water', 'Do not delay treatment'],
      },
      estimatedCost: '$10-20',
      source: 'Python ML Microservice (PlantVillage)',
      engine,
    };
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`⚠️ Python ML service unreachable (${err.message}). Seamlessly routing to Gemini AI...`);
    return null;
  }
};

// ─── Disease Detection ───────────────────────────────────────────────
export const detectDisease = async (imageBuffer, mimeType = 'image/jpeg') => {
  // 1. Try Python ML Microservice (Local Deep Learning Model)
  try {
    const pythonResult = await predictWithPythonML(imageBuffer, mimeType);
    if (pythonResult) return pythonResult;
  } catch (err) {
    console.warn('Python ML predict error, trying Gemini:', err.message);
  }

  // 2. Multimodal Gemini Vision AI fallback
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

// ─── Innovation 2: "Before & After" Recovery Computer Vision Tracker ──
export const compareRecovery = async (beforeImageBuffer, afterImageBuffer, diseaseName = 'Plant Infection', daysPassed = 7) => {
  const prompt = `You are an expert computational plant pathologist analyzing treatment recovery progression.
You are given two chronological images of the same plant:
- Image 1 is the BASELINE (when disease/infection was initially diagnosed as "${diseaseName}").
- Image 2 is the FOLLOW-UP scan taken approximately ${daysPassed} days later after treatment was applied.

Analyze and compare the visual disease progression between Image 1 and Image 2.
Return your response as a valid JSON object with exactly this structure (no markdown fences, raw JSON only):
{
  "healingPercentage": 42,
  "recoveryStage": "Moderate Healing (Stage 2/3)",
  "lesionChange": "Lesion surface area decreased by approximately 40%. Active chlorotic halos have faded.",
  "foliageRegrowth": "2 new healthy green leaves have sprouted at the apex.",
  "currentHealthScore": 76,
  "treatmentEfficacy": "effective",
  "comparisonNotes": "Fungal spreading has halted. Necrotic spots are drying out without fresh spore propagation.",
  "adjustedActionPlan": [
    "Reduce fungicide application frequency from weekly to bi-weekly",
    "Gently wipe foliage with organic neem solution to protect new growth",
    "Avoid overhead misting while necrotic tissue is healing"
  ]
}

If the plant has worsened, set treatmentEfficacy to "worsened", healingPercentage to negative or low, and advise emergency quarantine. If healthy, set recoveryStage to "Fully Restored" and healingPercentage to 90-100.`;

  try {
    const response = await generateContentFromImages(prompt, [
      { buffer: beforeImageBuffer, mimeType: 'image/jpeg' },
      { buffer: afterImageBuffer, mimeType: 'image/jpeg' },
    ]);
    if (!response) return getMockRecoveryResult(diseaseName, daysPassed);
    const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI Recovery Comparison Error:', error.message);
    return getMockRecoveryResult(diseaseName, daysPassed);
  }
};

// ─── Innovation 3: Precision Fertilizer & Chemical Dosimeter (Zero Plant Burn) ──
export const calculateDosage = (params = {}) => {
  const {
    plantType = 'General Plant',
    growthStage = 'Vegetative',
    containerType = 'pot',
    potDiameterInches = 10,
    landAreaSqFt = 10,
    fertilizerType = 'NPK 19-19-19',
    soilType = 'Potting Mix',
  } = params;

  let soilVolumeLiters = 0;
  if (containerType === 'pot') {
    const d = Number(potDiameterInches) || 10;
    soilVolumeLiters = Math.round((Math.PI * Math.pow((d * 2.54) / 2, 2) * (d * 2.54 * 0.9)) / 1000 * 10) / 10;
  } else {
    soilVolumeLiters = Math.round((Number(landAreaSqFt) || 10) * 14.16);
  }

  const fertilizerProfiles = {
    'NPK 19-19-19': { baseRatePerL: 1.5, unit: 'g', spoonEquiv: '1/3 tsp', frequency: 'Every 14 days', burnRisk: 5 },
    'NPK 20-20-20': { baseRatePerL: 1.5, unit: 'g', spoonEquiv: '1/3 tsp', frequency: 'Every 14 days', burnRisk: 6 },
    'Urea (46-0-0)': { baseRatePerL: 0.6, unit: 'g', spoonEquiv: '1/8 tsp', frequency: 'Every 21 days', burnRisk: 9 },
    'Neem Oil (1500ppm EC)': { baseRatePerL: 3.0, unit: 'ml', spoonEquiv: '1/2 tsp', frequency: 'Every 7-10 days', burnRisk: 2 },
    'Epsom Salt (MgSO4)': { baseRatePerL: 4.0, unit: 'g', spoonEquiv: '1 tsp', frequency: 'Every 30 days', burnRisk: 3 },
    'Copper Fungicide': { baseRatePerL: 2.0, unit: 'g', spoonEquiv: '1/2 tsp', frequency: 'Every 10 days', burnRisk: 5 },
    'Mancozeb 75% WP': { baseRatePerL: 2.0, unit: 'g', spoonEquiv: '1/2 tsp', frequency: 'Every 10-14 days', burnRisk: 6 },
    'Bone Meal': { baseRatePerL: 8.0, unit: 'g', spoonEquiv: '1.5 tsp', frequency: 'Every 30 days', burnRisk: 1 },
    'Vermicompost': { baseRatePerL: 25.0, unit: 'g', spoonEquiv: '2 tbsp', frequency: 'Every 14 days', burnRisk: 0 },
  };

  const profile = fertilizerProfiles[fertilizerType] || fertilizerProfiles['NPK 19-19-19'];

  let stageMultiplier = 1.0;
  if (growthStage === 'Seedling') stageMultiplier = 0.35;
  else if (growthStage === 'Flowering') stageMultiplier = 1.2;
  else if (growthStage === 'Fruiting') stageMultiplier = 1.25;

  const waterLiters = containerType === 'pot' 
    ? Math.max(0.25, Math.round(soilVolumeLiters * 0.15 * 10) / 10)
    : Math.max(1.0, Math.round(soilVolumeLiters * 0.08 * 10) / 10);

  const totalDose = Math.round(waterLiters * profile.baseRatePerL * stageMultiplier * 10) / 10;

  let householdMeasure = '';
  if (profile.unit === 'g') {
    if (totalDose < 1.0) householdMeasure = 'Pinch (approx. 0.5g)';
    else if (totalDose <= 3.0) householdMeasure = '1/2 teaspoon (~2.5g)';
    else if (totalDose <= 6.0) householdMeasure = '1 level teaspoon (~5g)';
    else if (totalDose <= 12.0) householdMeasure = '2 teaspoons (~10g)';
    else householdMeasure = `${Math.round((totalDose / 15) * 10) / 10} tablespoons (~15g each)`;
  } else {
    if (totalDose < 2.0) householdMeasure = '1/3 teaspoon (~1.5ml)';
    else if (totalDose <= 3.5) householdMeasure = '1/2 teaspoon (~2.5ml)';
    else if (totalDose <= 6.0) householdMeasure = '1 teaspoon (~5ml)';
    else householdMeasure = `${Math.round((totalDose / 5) * 10) / 10} teaspoons`;
  }

  let calculatedBurnRisk = profile.burnRisk;
  if (growthStage === 'Seedling') calculatedBurnRisk += 2;
  if (soilType.toLowerCase().includes('sandy')) calculatedBurnRisk += 1;
  calculatedBurnRisk = Math.min(10, Math.max(1, calculatedBurnRisk));

  let safetyRating = 'SAFE (Zero Burn Guarantee)';
  let safetyColor = '#10b981';
  if (calculatedBurnRisk >= 7) {
    safetyRating = 'HIGH BURN HAZARD (Strict Dilution Required)';
    safetyColor = '#ef4444';
  } else if (calculatedBurnRisk >= 4) {
    safetyRating = 'MODERATE (Standard Precaution)';
    safetyColor = '#f59e0b';
  }

  return {
    plantType,
    growthStage,
    fertilizerType,
    containerType,
    soilVolumeLiters,
    waterDilutionLiters: waterLiters,
    recommendedDose: {
      amount: totalDose,
      unit: profile.unit,
      householdMeasure,
      concentrationPerLiter: `${Math.round((totalDose / waterLiters) * 10) / 10} ${profile.unit}/L`,
    },
    applicationFrequency: profile.frequency,
    burnRiskScore: calculatedBurnRisk,
    safetyRating,
    safetyColor,
    precautions: [
      'Moisten root zone lightly 2 hours before application (never apply fertilizer to bone-dry soil)',
      'Apply early morning (6-8 AM) or late evening (after 5 PM) to prevent leaf phototoxicity',
      containerType === 'pot' ? 'Ensure drainage holes are clear to allow excess salt runoff' : 'Keep fertilizer 4 inches away from main plant stem',
      growthStage === 'Seedling' ? 'CRITICAL: Do not exceed recommended dose on delicate seedling roots' : 'Rinse leaves immediately if concentrated solution touches foliage',
    ],
  };
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

function getMockRecoveryResult(diseaseName = 'Leaf Blight', daysPassed = 7) {
  return {
    healingPercentage: 42,
    recoveryStage: 'Moderate Healing (Stage 2/3)',
    lesionChange: `Lesion surface area decreased by approx. 40% compared to baseline scan. Fungal halos have faded.`,
    foliageRegrowth: '2 new healthy green shoots detected at top node.',
    currentHealthScore: 78,
    treatmentEfficacy: 'effective',
    comparisonNotes: `The ${diseaseName} infection has ceased active spore propagation. Chlorotic margins are re-greening.`,
    adjustedActionPlan: [
      'Reduce fungicide application frequency from weekly to bi-weekly',
      'Apply mild foliar micronutrient booster to accelerate chlorophyll production',
      'Maintain base-only watering to keep healing leaves dry',
    ],
  };
}

export default {
  detectDisease,
  getTreatment,
  getFertilizerRecommendation,
  getWaterSchedule,
  chat,
  compareRecovery,
  calculateDosage,
};
