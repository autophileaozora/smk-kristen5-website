import mongoose from 'mongoose';

const statsCardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    // 'ekskul' | 'fasilitas' | 'jurusan' | 'tahun' → auto-count from collection
    // 'custom' → use customValue
    dataSource: {
      type: String,
      enum: ['ekskul', 'fasilitas', 'jurusan', 'tahun', 'custom'],
      default: 'custom',
    },
    customValue: { type: String, default: '0', trim: true },
    linkUrl: { type: String, default: '', trim: true },
    linkText: { type: String, default: 'Lihat Selengkapnya', trim: true },
    borderColor: { type: String, default: '#008fd7', trim: true },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('StatsCard', statsCardSchema);
