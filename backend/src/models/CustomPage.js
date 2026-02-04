import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // 'hero', 'text', 'image', 'button', etc.
  props: { type: mongoose.Schema.Types.Mixed, default: {} }, // Component props
  children: [{ type: mongoose.Schema.Types.Mixed }], // Nested blocks
  order: { type: Number, default: 0 },
}, { _id: false });

const customPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  description: {
    type: String,
    trim: true,
  },
  blocks: [blockSchema],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    ogImage: String,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Index for faster queries
customPageSchema.index({ slug: 1, status: 1 });
customPageSchema.index({ createdAt: -1 });

// Generate slug from title if not provided
customPageSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

const CustomPage = mongoose.model('CustomPage', customPageSchema);

export default CustomPage;