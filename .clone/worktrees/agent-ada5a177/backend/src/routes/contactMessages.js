import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';

const router = express.Router();

// POST /api/contact-messages — public, save new message
router.post('/', async (req, res) => {
  try {
    const { namaLengkap, email, pertanyaan } = req.body;
    if (!namaLengkap || !email || !pertanyaan) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi.' });
    }
    const msg = await ContactMessage.create({ namaLengkap, email, pertanyaan });
    res.status(201).json({ success: true, data: { id: msg._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contact-messages/count — public, for admin badge
router.get('/count', protect, isAdministrator, async (req, res) => {
  try {
    const unread = await ContactMessage.countDocuments({ isRead: false });
    res.json({ success: true, unread });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contact-messages — admin only
router.get('/', protect, isAdministrator, async (req, res) => {
  try {
    const { isRead } = req.query;
    const filter = {};
    if (isRead === 'true') filter.isRead = true;
    if (isRead === 'false') filter.isRead = false;
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: { messages } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/contact-messages/:id/read — mark as read
router.patch('/:id/read', protect, isAdministrator, async (req, res) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ success: false, message: 'Pesan tidak ditemukan' });
    res.json({ success: true, data: { message: msg } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/contact-messages/:id — admin only
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Pesan dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
