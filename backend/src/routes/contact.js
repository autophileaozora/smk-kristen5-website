import express from 'express';
import Contact from '../models/Contact.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/contact
// @desc    Get current contact information
// @access  Public
router.get('/', async (req, res) => {
  try {
    let contact = await Contact.findOne({ isCurrent: true });

    // If no contact exists, create default one
    if (!contact) {
      contact = await Contact.create({
        address: 'Jl. Opak, Metuk, Tegalyoso, Dusun 1, Tegalyoso, Kec. Klaten Sel., Kabupaten Klaten, Jawa Tengah 57424',
        phone: '(0272) 325260',
        whatsapp: '08881082xx',
        email: 'smkrisma@sch.id',
        operatingHours: {
          weekdays: '07:00 - 16:00',
          saturday: '07:00 - 14:00',
          sunday: 'Tutup'
        },
        socialMedia: {
          instagram: 'https://www.instagram.com/',
          facebook: 'https://www.facebook.com/',
          youtube: 'https://www.youtube.com/',
          twitter: 'https://www.twitter.com/'
        },
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.6789!2d110.6078!3d-7.7123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwNDInNDQuMyJTIDExMMKwMzYnMjguMSJF!5e0!3m2!1sen!2sid!4v1234567890',
        heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil informasi kontak',
      error: error.message
    });
  }
});

// @route   PUT /api/contact
// @desc    Update contact information
// @access  Private/Admin
router.put('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses. Hanya administrator yang dapat mengubah informasi kontak.'
      });
    }

    const {
      address,
      phone,
      whatsapp,
      email,
      operatingHours,
      socialMedia,
      mapUrl,
      heroImage,
      schoolLogo,
      principal
    } = req.body;

    // Find current contact or create new one
    let contact = await Contact.findOne({ isCurrent: true });

    if (!contact) {
      contact = await Contact.create({
        address,
        phone,
        whatsapp,
        email,
        operatingHours,
        socialMedia,
        mapUrl,
        heroImage,
        schoolLogo,
        principal,
        isCurrent: true
      });
    } else {
      // Update existing contact
      contact.address = address || contact.address;
      contact.phone = phone || contact.phone;
      contact.whatsapp = whatsapp || contact.whatsapp;
      contact.email = email || contact.email;
      contact.operatingHours = operatingHours || contact.operatingHours;
      contact.socialMedia = socialMedia || contact.socialMedia;
      contact.mapUrl = mapUrl || contact.mapUrl;

      // Allow empty string for images (to delete them)
      if (heroImage !== undefined) contact.heroImage = heroImage;
      if (schoolLogo !== undefined) contact.schoolLogo = schoolLogo;

      // Update principal information
      if (principal !== undefined) contact.principal = principal;

      await contact.save();
    }

    res.status(200).json({
      success: true,
      message: 'Informasi kontak berhasil diperbarui',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui informasi kontak',
      error: error.message
    });
  }
});

export default router;
