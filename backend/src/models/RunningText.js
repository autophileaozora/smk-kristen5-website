import mongoose from 'mongoose';

const runningTextSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: [true, 'Running text content is required'],
      maxlength: [500, 'Running text cannot exceed 500 characters'],
      trim: true,
    },
    link: {
      type: String,
      trim: true,
      default: null,
    },
    order: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
runningTextSchema.index({ isActive: 1, order: 1 });

const RunningText = mongoose.model('RunningText', runningTextSchema);

export default RunningText;
