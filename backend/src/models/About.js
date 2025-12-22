import mongoose from 'mongoose';

const aboutSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: [true, 'Section is required'],
      enum: ['sejarah', 'visi-misi'],
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    image: {
      type: String, // Cloudinary URL
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
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
aboutSchema.index({ section: 1, isActive: 1 });

const About = mongoose.model('About', aboutSchema);

export default About;
