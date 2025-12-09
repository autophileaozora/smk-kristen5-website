import mongoose from 'mongoose';

const mataPelajaranSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama mata pelajaran is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String, // Cloudinary URL for icon/image
      default: null,
    },
    // Category: which jurusan can see this subject
    // Can be: "PUBLIC" or specific jurusan code like "TKJ", "RPL", "AKL"
    category: {
      type: String,
      required: [true, 'Category is required'],
      uppercase: true,
      default: 'PUBLIC',
    },
    // Optional: semester info
    semester: {
      type: Number,
      min: 1,
      max: 6,
      default: null,
    },
    // Optional: hours per week
    hoursPerWeek: {
      type: Number,
      min: 0,
      default: null,
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

// Index for faster queries
mataPelajaranSchema.index({ category: 1, isActive: 1 });

const MataPelajaran = mongoose.model('MataPelajaran', mataPelajaranSchema);

export default MataPelajaran;
