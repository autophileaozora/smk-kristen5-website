import mongoose from 'mongoose';

const prestasiSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
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
      enum: ['akademik', 'olahraga', 'seni', 'teknologi', 'lainnya'],
      default: 'lainnya',
    },
    date: {
      type: Date,
      required: [true, 'Achievement date is required'],
    },
    participants: {
      type: String,
      required: [true, 'Participants are required'],
      maxlength: [300, 'Participants cannot exceed 300 characters'],
    },
    level: {
      type: String,
      enum: ['sekolah', 'kecamatan', 'kabupaten', 'provinsi', 'nasional', 'internasional'],
      default: 'sekolah',
    },
    jurusan: {
      type: String,
      trim: true,
      uppercase: true,
      default: null, // Null means it's for all jurusan (PUBLIC)
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
prestasiSchema.index({ date: -1 });
prestasiSchema.index({ category: 1, level: 1 });

const Prestasi = mongoose.model('Prestasi', prestasiSchema);

export default Prestasi;
