// ─── User Types ──────────────────────────────────────────────────────
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  location: string;
  phone: string;
  bio: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
  plantsCount: number;
  scansCount: number;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Plant Types ─────────────────────────────────────────────────────
export interface Plant {
  _id: string;
  user: string;
  name: string;
  category: string;
  type: string;
  age: { value: number; unit: string };
  location: string;
  image: { url: string; publicId: string };
  healthScore: number;
  status: 'healthy' | 'diseased' | 'recovering' | 'critical';
  lastWatered: string | null;
  lastFertilized: string | null;
  waterSchedule: { frequency: string; amount: string; nextWatering: string | null };
  fertilizerSchedule: { frequency: string; type: string; nextFertilizing: string | null };
  diseases: Array<{ name: string; detectedAt: string; resolved: boolean; severity: string }>;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Disease Types ───────────────────────────────────────────────────
export interface Disease {
  _id: string;
  name: string;
  description: string;
  symptoms: string[];
  causes: string[];
  severity: string;
  affectedPlants: string[];
  treatments: { organic: string[]; chemical: string[]; homeRemedies: string[] };
  prevention: string[];
  recoveryTime: string;
  images: string[];
}

// ─── Report Types ────────────────────────────────────────────────────
export interface Report {
  _id: string;
  user: string;
  plant: Plant | null;
  scanImage: { url: string; publicId: string };
  disease: { name: string; confidence: number; severity: string; description: string };
  symptoms: string[];
  causes: string[];
  treatments: { organic: string[]; chemical: string[]; homeRemedies: string[] };
  prevention: string[];
  healthScore: number;
  recoveryTime: string;
  aiResponse: Record<string, unknown>;
  createdAt: string;
}

// ─── AI Result Types ─────────────────────────────────────────────────
export interface AIScanResult {
  isHealthy: boolean;
  disease: { name: string; confidence: number; severity: string; description: string };
  healthScore: number;
  symptoms: string[];
  causes: string[];
  treatments: { organic: string[]; chemical: string[]; homeRemedies: string[] };
  prevention: string[];
  recoveryTime: string;
  dosAndDonts: { dos: string[]; donts: string[] };
  estimatedCost: string;
}

// ─── Chat Types ──────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: string;
}

export interface ChatConversation {
  _id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Notification Types ──────────────────────────────────────────────
export interface Notification {
  _id: string;
  type: 'water' | 'fertilizer' | 'disease' | 'weather' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  data: Record<string, unknown>;
  createdAt: string;
}

// ─── Weather Types ───────────────────────────────────────────────────
export interface Weather {
  location: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  rainChance: number;
  sunrise: string;
  sunset: string;
}

export interface WeatherAdvice {
  icon: string;
  title: string;
  message: string;
}

export interface Forecast {
  date: string;
  temperature: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  condition: string;
  description: string;
  icon: string;
  windSpeed: number;
  rainChance: number;
}

// ─── Growth Record & Recovery ────────────────────────────────────────
export interface GrowthRecord {
  _id: string;
  plant: string;
  image: { url: string; publicId: string };
  height: { value: number; unit: string };
  leafCount: number;
  healthScore: number;
  notes: string;
  isFollowUp?: boolean;
  baselineRecord?: string | null;
  healingPercentage?: number;
  recoveryStage?: string;
  lesionChange?: string;
  treatmentEfficacy?: string;
  adjustedActionPlan?: string[];
  recordedAt: string;
}

// ─── Dosimeter & Outbreak Types ──────────────────────────────────────
export interface DosimeterPlan {
  plantType: string;
  growthStage: string;
  fertilizerType: string;
  containerType: 'pot' | 'ground';
  soilVolumeLiters: number;
  waterDilutionLiters: number;
  recommendedDose: {
    amount: number;
    unit: string;
    householdMeasure: string;
    concentrationPerLiter: string;
  };
  applicationFrequency: string;
  burnRiskScore: number;
  safetyRating: string;
  safetyColor: string;
  precautions: string[];
}

export interface OutbreakCluster {
  id: string;
  disease: string;
  pathogenType: string;
  city: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  reportedCases: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskLevel: string;
  affectedCrops: string[];
  primaryVector: string;
  preventiveProtocol: string[];
  lastDetected: string;
}

export interface OutbreakStats {
  totalActiveOutbreaks: number;
  totalCasesTracked: number;
  criticalZonesCount: number;
  dominantThreat: string;
  lastRadarSweep: string;
}

// ─── API Response ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
