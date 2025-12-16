import mongoose from 'mongoose';

const socialMediaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Social media name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
    },
    icon: {
      type: String, // Cloudinary URL or uploaded icon
      required: [true, 'Icon is required'],
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
socialMediaSchema.index({ isActive: 1, order: 1 });

const SocialMedia = mongoose.model('SocialMedia', socialMediaSchema);

export default SocialMedia;
