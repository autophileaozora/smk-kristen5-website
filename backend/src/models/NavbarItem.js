import mongoose from 'mongoose';

const navbarItemSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Label is required'],
      trim: true,
      maxlength: [100, 'Label cannot exceed 100 characters'],
    },
    url: {
      type: String,
      default: '#',
      trim: true,
    },
    // Parent item for dropdown menus (null = top level)
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NavbarItem',
      default: null,
    },
    // Order within the same level
    order: {
      type: Number,
      default: 0,
    },
    // Is this item a dropdown (has children)?
    isDropdown: {
      type: Boolean,
      default: false,
    },
    // Target for link (_self, _blank)
    target: {
      type: String,
      enum: ['_self', '_blank'],
      default: '_self',
    },
    // Icon (optional)
    icon: {
      type: String,
      default: '',
    },
    // Is active?
    isActive: {
      type: Boolean,
      default: true,
    },
    // Special flags
    isButton: {
      type: Boolean,
      default: false, // If true, renders as button (e.g., "PENDAFTARAN")
    },
    buttonVariant: {
      type: String,
      enum: ['primary', 'secondary', 'outline'],
      default: 'primary',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for children (dropdown items)
navbarItemSchema.virtual('children', {
  ref: 'NavbarItem',
  localField: '_id',
  foreignField: 'parent',
  options: { sort: { order: 1 } },
});

// Index for better query performance
navbarItemSchema.index({ parent: 1, order: 1 });
navbarItemSchema.index({ isActive: 1, order: 1 });

// Static method to get menu tree
navbarItemSchema.statics.getMenuTree = async function () {
  // Get all top-level items with their children populated
  const menuItems = await this.find({ parent: null, isActive: true })
    .sort({ order: 1 })
    .populate({
      path: 'children',
      match: { isActive: true },
      options: { sort: { order: 1 } },
    })
    .lean();

  return menuItems;
};

// Static method to get all items (flat list for admin)
navbarItemSchema.statics.getAllItems = async function () {
  const items = await this.find()
    .sort({ parent: 1, order: 1 })
    .populate('parent', 'label')
    .lean();

  return items;
};

const NavbarItem = mongoose.model('NavbarItem', navbarItemSchema);

export default NavbarItem;
