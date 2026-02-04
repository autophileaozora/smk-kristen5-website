import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['akademik', 'non-akademik'],
      default: 'akademik',
    },
    eventDate: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      default: '07:00',
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      default: '12:00',
    },
    location: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
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

// Index for querying upcoming events
eventSchema.index({ eventDate: 1, isActive: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;
