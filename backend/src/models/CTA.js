import mongoose from 'mongoose';

const ctaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    // Primary button
    primaryButtonText: {
      type: String,
      required: [true, 'Primary button text is required'],
      trim: true,
      maxlength: [100, 'Primary button text cannot exceed 100 characters'],
    },
    primaryButtonLink: {
      type: String,
      required: [true, 'Primary button link is required'],
      trim: true,
    },
    // Secondary button
    secondaryButtonText: {
      type: String,
      trim: true,
      maxlength: [100, 'Secondary button text cannot exceed 100 characters'],
      default: '',
    },
    secondaryButtonLink: {
      type: String,
      trim: true,
      default: '',
    },
    backgroundImage: {
      type: String, // Cloudinary URL
      default: null,
    },
    backgroundColor: {
      type: String,
      default: '#0D76BE', // Default blue color
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
ctaSchema.index({ isActive: 1 });

const CTA = mongoose.model('CTA', ctaSchema);

export default CTA;
