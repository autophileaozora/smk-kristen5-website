import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  // Basic Contact Information
  address: {
    type: String,
    required: [true, 'Alamat harus diisi'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Nomor telepon harus diisi'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    trim: true,
    lowercase: true
  },

  // Operating Hours
  operatingHours: {
    weekdays: {
      type: String,
      default: '07:00 - 16:00'
    },
    saturday: {
      type: String,
      default: '07:00 - 14:00'
    },
    sunday: {
      type: String,
      default: 'Tutup'
    }
  },

  // Social Media Links
  socialMedia: {
    instagram: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    }
  },

  // Map and Hero Image
  mapUrl: {
    type: String,
    trim: true
  },
  heroImage: {
    type: String,
    trim: true
  },

  // School Logo
  schoolLogo: {
    type: String,
    trim: true
  },

  // Principal Information
  principal: {
    name: {
      type: String,
      trim: true
    },
    title: {
      type: String,
      trim: true,
      default: 'Kepala Sekolah'
    },
    photo: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    }
  },

  // Single instance flag (we only want one contact info document)
  isCurrent: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one contact info document exists
contactSchema.pre('save', async function(next) {
  if (this.isCurrent) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isCurrent: false }
    );
  }
  next();
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
