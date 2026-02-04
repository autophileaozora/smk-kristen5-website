import mongoose from 'mongoose';

const activityItemSchema = new mongoose.Schema({
  image: {
    type: String, // Cloudinary URL
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 0,
  },
});

const activityTabSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tab name is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    items: [activityItemSchema],
    order: {
      type: Number,
      default: 0,
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

const ActivityTab = mongoose.model('ActivityTab', activityTabSchema);

// Separate model for global settings (like the global link)
const activitySettingsSchema = new mongoose.Schema(
  {
    globalLink: {
      type: String,
      default: '/kegiatan',
    },
    globalButtonText: {
      type: String,
      default: 'Explore Kegiatan Siswa',
    },
    sectionTitle: {
      type: String,
      default: 'Pembelajaran & Kegiatan',
    },
    sectionSubtitle: {
      type: String,
      default: 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const ActivitySettings = mongoose.model('ActivitySettings', activitySettingsSchema);

export { ActivityTab, ActivitySettings };
