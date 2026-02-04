import mongoose from 'mongoose';

const heroSettingsSchema = new mongoose.Schema(
  {
    slideDuration: {
      type: Number,
      default: 5000, // 5 seconds in milliseconds
      min: [1000, 'Minimum duration is 1 second'],
      max: [30000, 'Maximum duration is 30 seconds'],
    },
    autoPlay: {
      type: Boolean,
      default: true,
    },
    showIndicators: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists
heroSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const HeroSettings = mongoose.model('HeroSettings', heroSettingsSchema);

export default HeroSettings;
