import mongoose from 'mongoose';

const ctaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: [500, 'Subtitle cannot exceed 500 characters'],
      default: '',
    },
    buttonText: {
      type: String,
      required: [true, 'Button text is required'],
      trim: true,
      maxlength: [100, 'Button text cannot exceed 100 characters'],
    },
    buttonLink: {
      type: String,
      required: [true, 'Button link is required'],
      trim: true,
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
