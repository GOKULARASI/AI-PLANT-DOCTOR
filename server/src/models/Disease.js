import mongoose from 'mongoose';

const diseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Disease name is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    symptoms: [{ type: String }],
    causes: [{ type: String }],
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    affectedPlants: [{ type: String }],
    treatments: {
      organic: [{ type: String }],
      chemical: [{ type: String }],
      homeRemedies: [{ type: String }],
    },
    prevention: [{ type: String }],
    recoveryTime: {
      type: String,
      default: '1-2 weeks',
    },
    images: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

diseaseSchema.index({ name: 'text', description: 'text' });

const Disease = mongoose.model('Disease', diseaseSchema);
export default Disease;
