import mongoose from 'mongoose';

const ekskulSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ekskul name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    image: {
      type: String, // Cloudinary URL
      default: null,
    },
    category: {
      type: String,
      enum: ['olahraga', 'seni', 'akademik', 'keagamaan', 'teknologi', 'lainnya'],
      default: 'lainnya',
    },
    coach: {
      type: String,
      required: [true, 'Coach/Pembina name is required'],
      maxlength: [100, 'Coach name cannot exceed 100 characters'],
    },
    schedule: {
      type: String, // e.g., "Senin & Rabu, 15:00-17:00"
      required: [true, 'Schedule is required'],
      maxlength: [200, 'Schedule cannot exceed 200 characters'],
    },
    location: {
      type: String,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    achievements: {
      type: String, // Simple text list of achievements
      maxlength: [500, 'Achievements cannot exceed 500 characters'],
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

// Auto-generate slug from name
ekskulSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for better query performance
ekskulSchema.index({ name: 1 });
ekskulSchema.index({ category: 1 });

const Ekskul = mongoose.model('Ekskul', ekskulSchema);

export default Ekskul;

