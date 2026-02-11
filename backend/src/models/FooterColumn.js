import mongoose from 'mongoose';

const footerItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'link', 'icon-link', 'image'],
    default: 'text',
  },
  content: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    default: '',
  },
  icon: {
    type: String, // Icon name or URL
    default: '',
  },
  target: {
    type: String,
    enum: ['_self', '_blank'],
    default: '_self',
  },
  order: {
    type: Number,
    default: 0,
  },
});

const footerColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['logo', 'links', 'text', 'social', 'custom'],
      default: 'links',
    },
    items: [footerItemSchema],
    order: {
      type: Number,
      default: 0,
    },
    width: {
      type: String,
      enum: ['auto', '1', '2', '3', '4'],
      default: 'auto',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    showBullets: {
      type: Boolean,
      default: true,
    },
    // For logo column
    logoUrl: {
      type: String,
      default: '',
    },
    logoSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium',
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Get all active columns ordered
footerColumnSchema.statics.getFooterData = async function () {
  const columns = await this.find({ isActive: true })
    .sort({ order: 1 })
    .lean();

  // Sort items within each column
  return columns.map((col) => ({
    ...col,
    items: col.items?.sort((a, b) => a.order - b.order) || [],
  }));
};

const FooterColumn = mongoose.model('FooterColumn', footerColumnSchema);

export default FooterColumn;
