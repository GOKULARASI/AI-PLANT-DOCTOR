import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: ['bug', 'feature', 'general', 'complaint'],
      default: 'general',
    },
    message: {
      type: String,
      required: [true, 'Feedback message is required'],
      maxlength: [1000, 'Feedback cannot exceed 1000 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
