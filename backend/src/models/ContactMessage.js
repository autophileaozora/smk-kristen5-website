import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    namaLengkap: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Nama tidak boleh lebih dari 100 karakter'],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    pertanyaan: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, 'Pesan tidak boleh lebih dari 2000 karakter'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

contactMessageSchema.index({ isRead: 1, createdAt: -1 });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
