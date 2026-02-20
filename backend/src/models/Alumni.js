import mongoose from 'mongoose';

const alumniSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Alumni name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    photo: {
      type: String, // Cloudinary URL
      default: null,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [1900, 'Invalid graduation year'],
      max: [new Date().getFullYear(), 'Graduation year cannot be in the future'],
    },
    jurusan: {
      type: String,
      required: [true, 'Jurusan is required'],
      maxlength: [100, 'Jurusan cannot exceed 100 characters'],
    },
    currentOccupation: {
      type: String, // Current job/position
      maxlength: [200, 'Current occupation cannot exceed 200 characters'],
    },
    company: {
      type: String, // Company/Organization name
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    university: {
      type: String, // If continuing to higher education
      maxlength: [200, 'University name cannot exceed 200 characters'],
    },
    achievement: {
      type: String, // Notable achievement
      maxlength: [500, 'Achievement cannot exceed 500 characters'],
    },
    testimonial: {
      type: String, // Testimonial about school
      maxlength: [1000, 'Testimonial cannot exceed 1000 characters'],
    },
    linkedIn: {
      type: String,
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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

// Auto-generate slug from name and graduation year
alumniSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isModified('graduationYear') || !this.slug) {
    this.slug = `${this.name}-${this.graduationYear}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Index for better query performance
alumniSchema.index({ name: 1 });
alumniSchema.index({ graduationYear: -1 });
alumniSchema.index({ jurusan: 1 });
alumniSchema.index({ isFeatured: 1, isPublished: 1 });

const Alumni = mongoose.model('Alumni', alumniSchema);

export default Alumni;

