import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Plant name is required'],
      trim: true,
      maxlength: [100, 'Plant name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      enum: ['Flowers', 'Vegetables', 'Fruits', 'Indoor', 'Outdoor', 'Medicinal', 'Herbs', 'Succulents', 'Trees', 'Other'],
      default: 'Other',
    },
    type: {
      type: String,
      trim: true,
      default: '',
    },
    age: {
      value: { type: Number, default: 0 },
      unit: { type: String, enum: ['days', 'weeks', 'months', 'years'], default: 'months' },
    },
    location: {
      type: String,
      default: '',
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    healthScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['healthy', 'diseased', 'recovering', 'critical'],
      default: 'healthy',
    },
    lastWatered: {
      type: Date,
      default: null,
    },
    lastFertilized: {
      type: Date,
      default: null,
    },
    waterSchedule: {
      frequency: { type: String, default: 'Every 2 days' },
      amount: { type: String, default: '200ml' },
      nextWatering: { type: Date, default: null },
    },
    fertilizerSchedule: {
      frequency: { type: String, default: 'Every 2 weeks' },
      type: { type: String, default: '' },
      nextFertilizing: { type: Date, default: null },
    },
    diseases: [
      {
        name: { type: String },
        detectedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false },
        resolvedAt: { type: Date },
        severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
      },
    ],
    notes: {
      type: String,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
plantSchema.index({ name: 'text', type: 'text' });

const Plant = mongoose.model('Plant', plantSchema);
export default Plant;
