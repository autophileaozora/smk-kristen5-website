import mongoose from 'mongoose';

const fasilitasSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nama fasilitas is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    image: {
      type: String, // Cloudinary URL
      default: null,
    },
    location: {
      type: String, // Optional location info (e.g., "Lantai 2, Gedung A")
      trim: true,
      default: '',
    },
    // Category: which jurusan can see this facility
    // Can be: "PUBLIC" or specific jurusan code like "TKJ", "RPL", "AKL"
    category: {
      type: String,
      required: [true, 'Category is required'],
      uppercase: true,
      default: 'PUBLIC',
    },
    // Optional: capacity for labs/rooms
    capacity: {
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
fasilitasSchema.index({ category: 1, isActive: 1 });

const Fasilitas = mongoose.model('Fasilitas', fasilitasSchema);

export default Fasilitas;
