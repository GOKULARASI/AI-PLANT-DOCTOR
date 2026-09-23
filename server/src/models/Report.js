import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      default: null,
    },
    scanImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    disease: {
      name: { type: String, default: 'Healthy' },
      confidence: { type: Number, default: 0 },
      severity: { type: String, enum: ['none', 'low', 'medium', 'high', 'critical'], default: 'none' },
      description: { type: String, default: '' },
    },
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    treatments: {
      organic: [{ type: String }],
      chemical: [{ type: String }],
      homeRemedies: [{ type: String }],
    },
    prevention: [{ type: String }],
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    recoveryTime: {
      type: String,
      default: '',
    },
    aiResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model('Report', reportSchema);
export default Report;
