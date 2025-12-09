import mongoose from 'mongoose';

const videoHeroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      validate: {
        validator: function(v) {
          // Validate YouTube URL format
          return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
        },
        message: 'Please provide a valid YouTube URL'
      }
    },
    youtubeId: {
      type: String, // Extracted from URL for easy embedding
    },
    description: {
      type: String,
      maxlength: [300, 'Description cannot exceed 300 characters'],
    },
    thumbnail: {
      type: String, // Auto-generated from YouTube
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0, // For carousel ordering
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

// Extract YouTube ID from URL before saving
videoHeroSchema.pre('save', function (next) {
  if (this.isModified('youtubeUrl')) {
    // Extract YouTube ID from various URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = this.youtubeUrl.match(regExp);
    
    if (match && match[2].length === 11) {
      this.youtubeId = match[2];
      // Generate thumbnail URL
      this.thumbnail = `https://img.youtube.com/vi/${this.youtubeId}/maxresdefault.jpg`;
    }
  }
  next();
});

// Limit to max 3 active videos
videoHeroSchema.pre('save', async function (next) {
  if (this.isActive) {
    const activeCount = await mongoose.model('VideoHero').countDocuments({
      isActive: true,
      _id: { $ne: this._id }
    });
    
    if (activeCount >= 3) {
      const error = new Error('Maximum 3 active hero videos allowed. Please deactivate another video first.');
      return next(error);
    }
  }
  next();
});

const VideoHero = mongoose.model('VideoHero', videoHeroSchema);

export default VideoHero;
