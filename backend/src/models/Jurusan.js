import mongoose from 'mongoose';

const jurusanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Jurusan name is required'],
      trim: true,
      unique: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Code is required'],
      trim: true,
      uppercase: true,
      unique: true,
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
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },
    vision: {
      type: String,
      default: '',
    },
    mission: {
      type: String,
      default: '',
    },
    headOfDepartment: {
      type: String,
      default: '',
    },
    logo: {
      type: String, // Cloudinary URL
      default: null,
    },
    backgroundImage: {
      type: String, // Cloudinary URL for card background
      default: null,
    },
    
    // TAB: Mata Pelajaran (Subjects)
    subjects: [{
      name: String,
      description: String,
      semester: Number, // Semester 1-6
    }],
    
    // TAB: Fasilitas (Facilities)
    facilities: [{
      name: String,
      description: String,
      image: String, // Cloudinary URL
    }],
    
    // Additional Info
    careerProspects: [{
      type: String,
      trim: true,
    }],
    competencies: [{
      type: String,
      trim: true,
    }],

    // Gallery
    gallery: [{
      url: {
        type: String,
        required: true,
      },
      caption: {
        type: String,
        default: '',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],

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

// Auto-generate slug from name
jurusanSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const Jurusan = mongoose.model('Jurusan', jurusanSchema);

export default Jurusan;
