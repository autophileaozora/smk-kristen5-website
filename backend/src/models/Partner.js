import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Partner name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    logo: {
      type: String, // Cloudinary URL
      required: [true, 'Logo is required'],
    },
    startYear: {
      type: Number,
      required: [true, 'Start year is required'],
      min: [1900, 'Start year must be valid'],
      max: [new Date().getFullYear() + 10, 'Start year cannot be too far in the future'],
    },
    endYear: {
      type: Number,
      default: null,
      min: [1900, 'End year must be valid'],
      validate: {
        validator: function(value) {
          if (value === null) return true;
          return value >= this.startYear;
        },
        message: 'End year must be greater than or equal to start year',
      },
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    order: {
      type: Number,
      default: 1,
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

// Index for better query performance
partnerSchema.index({ isActive: 1, order: 1 });
partnerSchema.index({ startYear: 1, endYear: 1 });

const Partner = mongoose.model('Partner', partnerSchema);

export default Partner;
