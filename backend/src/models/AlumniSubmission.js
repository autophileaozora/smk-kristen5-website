import mongoose from 'mongoose';

const alumniSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    photo: {
      url: { type: String },
      publicId: { type: String },
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [1990, 'Invalid graduation year'],
      max: [new Date().getFullYear(), 'Graduation year cannot be in the future'],
    },
    jurusan: {
      type: String,
      required: [true, 'Jurusan is required'],
      trim: true,
      maxlength: [100, 'Jurusan cannot exceed 100 characters'],
    },
    currentOccupation: {
      type: String,
      trim: true,
      maxlength: [200, 'Current occupation cannot exceed 200 characters'],
    },
    company: {
      type: String,
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Nomor telepon tidak boleh lebih dari 20 karakter'],
    },
    testimonial: {
      type: String,
      required: [true, 'Testimonial is required'],
      trim: true,
      maxlength: [1000, 'Testimonial cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [300, 'Rejection reason cannot exceed 300 characters'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    linkedAlumniId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Alumni',
    },
  },
  {
    timestamps: true,
  }
);

alumniSubmissionSchema.index({ status: 1, createdAt: -1 });

const AlumniSubmission = mongoose.model('AlumniSubmission', alumniSubmissionSchema);

export default AlumniSubmission;