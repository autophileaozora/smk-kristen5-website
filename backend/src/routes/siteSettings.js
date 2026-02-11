import express from 'express';
import SiteSettings from '../models/SiteSettings.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/site-settings
// @desc    Get site settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.getSettings();

    res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/site-settings
// @desc    Update site settings
// @access  Protected + Admin
router.put('/', protect, isAdministrator, async (req, res) => {
  try {
    let settings = await SiteSettings.getSettings();

    const allowedFields = [
      'siteName',
      'siteTagline',
      'logo',
      'logoLight',
      'favicon',
      'email',
      'phone',
      'whatsapp',
      'address',
      'googleMapsUrl',
      'googleMapsEmbed',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
      'googleAnalyticsId',
      'footerText',
      'footerDescription',
      'homepageSections',
    ];

    // Update only allowed fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'siteSettings',
      resourceId: settings._id,
      details: {
        updatedFields: Object.keys(req.body).filter((key) =>
          allowedFields.includes(key)
        ),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Site settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/site-settings/logo
// @desc    Update logo specifically
// @access  Protected + Admin
router.put('/logo', protect, isAdministrator, async (req, res) => {
  try {
    const { logo, logoLight } = req.body;

    if (!logo && !logoLight) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one logo URL',
      });
    }

    let settings = await SiteSettings.getSettings();

    if (logo) settings.logo = logo;
    if (logoLight) settings.logoLight = logoLight;

    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'siteSettings',
      resourceId: settings._id,
      details: { action: 'logo_update' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Logo updated successfully',
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/site-settings/contact
// @desc    Update contact info
// @access  Protected + Admin
router.put('/contact', protect, isAdministrator, async (req, res) => {
  try {
    const { email, phone, whatsapp, address, googleMapsUrl, googleMapsEmbed } =
      req.body;

    let settings = await SiteSettings.getSettings();

    if (email !== undefined) settings.email = email;
    if (phone !== undefined) settings.phone = phone;
    if (whatsapp !== undefined) settings.whatsapp = whatsapp;
    if (address !== undefined) settings.address = address;
    if (googleMapsUrl !== undefined) settings.googleMapsUrl = googleMapsUrl;
    if (googleMapsEmbed !== undefined) settings.googleMapsEmbed = googleMapsEmbed;

    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'siteSettings',
      resourceId: settings._id,
      details: { action: 'contact_update' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Contact info updated successfully',
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/site-settings/seo
// @desc    Update SEO settings
// @access  Protected + Admin
router.put('/seo', protect, isAdministrator, async (req, res) => {
  try {
    const { metaTitle, metaDescription, metaKeywords, googleAnalyticsId } =
      req.body;

    let settings = await SiteSettings.getSettings();

    if (metaTitle !== undefined) settings.metaTitle = metaTitle;
    if (metaDescription !== undefined) settings.metaDescription = metaDescription;
    if (metaKeywords !== undefined) settings.metaKeywords = metaKeywords;
    if (googleAnalyticsId !== undefined)
      settings.googleAnalyticsId = googleAnalyticsId;

    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'siteSettings',
      resourceId: settings._id,
      details: { action: 'seo_update' },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'SEO settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
