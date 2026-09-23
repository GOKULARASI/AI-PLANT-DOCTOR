import mongoose from 'mongoose';

const growthRecordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
      index: true,
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    height: {
      value: { type: Number, default: 0 },
      unit: { type: String, enum: ['cm', 'inches', 'feet'], default: 'cm' },
    },
    leafCount: { type: Number, default: 0 },
    healthScore: { type: Number, default: 100, min: 0, max: 100 },
    notes: { type: String, default: '', maxlength: 500 },
    recordedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const GrowthRecord = mongoose.model('GrowthRecord', growthRecordSchema);
export default GrowthRecord;
