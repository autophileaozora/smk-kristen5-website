import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
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
    },
    backgroundImage: {
      type: String,
      required: [true, 'Background image is required'],
    },
    primaryButtonText: {
      type: String,
      default: 'BAGIKAN CERITAMU',
      maxlength: [50, 'Button text cannot exceed 50 characters'],
    },
    primaryButtonLink: {
      type: String,
      default: '#',
    },
    secondaryButtonText: {
      type: String,
      default: 'LIHAT LEBIH LANJUT',
      maxlength: [50, 'Button text cannot exceed 50 characters'],
    },
    secondaryButtonLink: {
      type: String,
      default: '#',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
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

// Limit to max 5 active slides
heroSlideSchema.pre('save', async function (next) {
  if (this.isActive) {
    const activeCount = await mongoose.model('HeroSlide').countDocuments({
      isActive: true,
      _id: { $ne: this._id }
    });

    if (activeCount >= 5) {
      const error = new Error('Maximum 5 active hero slides allowed. Please deactivate another slide first.');
      return next(error);
    }
  }
  next();
});

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);

export default HeroSlide;
