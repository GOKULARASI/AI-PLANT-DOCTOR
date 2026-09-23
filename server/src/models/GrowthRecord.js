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
    isFollowUp: { type: Boolean, default: false },
    baselineRecord: { type: mongoose.Schema.Types.ObjectId, ref: 'GrowthRecord', default: null },
    healingPercentage: { type: Number, default: 0 },
    recoveryStage: { type: String, default: '' },
    lesionChange: { type: String, default: '' },
    treatmentEfficacy: { type: String, enum: ['effective', 'moderate', 'ineffective', 'worsened', ''], default: '' },
    adjustedActionPlan: [{ type: String }],
    recordedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const GrowthRecord = mongoose.model('GrowthRecord', growthRecordSchema);
export default GrowthRecord;
