import mongoose from 'mongoose';

const homepageSectionsSchema = new mongoose.Schema(
  {
    // Why Choose Us section
    whyTitle: { type: String, default: 'MENGAPA SEKOLAH DI KRISMA', trim: true },
    whyHeading: { type: String, default: 'SEKOLAH BINAAN DAIHATSU DAN MATERI BERDASARKAN INDUSTRIAL', trim: true },
    whyDescription: { type: String, default: 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.', trim: true },
    whyButtonText: { type: String, default: 'Baca Profil Sekolah', trim: true },
    whyButtonUrl: { type: String, default: '/tentang', trim: true },
    statsHeading: { type: String, default: 'ALUMNI KAMI TELAH BEKERJA DI TOP COMPANY', trim: true },
    foundingYear: { type: Number, default: 1999 },
    // Accelerate section
    accelerateTitle: { type: String, default: 'ACCELERATE YOUR ENTIRE POTENTIAL', trim: true },
    accelerateDescription: { type: String, default: 'MULAI DARI HARI PERTAMA, PROSES BELAJAR, HINGGA LULUS, SETIAP GURU SIAP MEMBANTU SISWA SMK KRISTEN 5 KLATEN MENCAPAI IMPIAN DAN SKILL YANG DIBUTUHKAN OLEH PERUSAHAAN AGAR SIAP BEKERJA', trim: true },
    // Testimonials section
    testimonialsTitle: { type: String, default: 'Cerita pengalaman menarik dan berkesan oleh alumni kami', trim: true },
    testimonialsDescription: { type: String, default: 'SMK Kristen 5 Klaten telah memiliki sertifikat ISO 9008:2015 dan menggandeng mitra industri guna menjamin mutu pendidikan dan keselarasan dengan industri.', trim: true },
    testimonialsButtonText: { type: String, default: 'BAGIKAN CERITAMU', trim: true },
    // News section
    newsTopTitle: { type: String, default: 'TOP 5 BERITA', trim: true },
    newsMainTitle: { type: String, default: 'BERITA UTAMA', trim: true },
    // Events section
    eventsTitle: { type: String, default: 'KEGIATAN SISWA DAN GURU', trim: true },
    eventsDescription: { type: String, default: 'AGENDA YANG AKAN HADIR DI SMK KRISTEN 5 KLATEN, BAIK ACARA DI SEKOLAH ATAUPUN LUAR SEKOLAH', trim: true },
    eventsButtonText: { type: String, default: 'LIHAT SEMUA AGENDA', trim: true },
    // Ekskul page hero
    ekskulHeroTitle: { type: String, default: 'EKSTRAKULIKULER', trim: true },
    ekskulHeroSubtitle: { type: String, default: 'Kembangkan potensi dan bakatmu bersama ekstrakulikuler pilihan di SMK Kristen 5 Klaten', trim: true },
    ekskulHeroBackground: { type: String, default: '', trim: true }, // Cloudinary URL
    // Fasilitas page hero
    fasilitasHeroTitle: { type: String, default: 'FASILITAS SEKOLAH', trim: true },
    fasilitasHeroSubtitle: { type: String, default: 'Menunjang kegiatan belajar mengajar dengan fasilitas modern dan lengkap untuk seluruh siswa', trim: true },
    fasilitasHeroBackground: { type: String, default: '', trim: true }, // Cloudinary URL
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    // Basic Info
    siteName: {
      type: String,
      default: 'SMK Kristen 5 Klaten',
      trim: true,
    },
    siteTagline: {
      type: String,
      default: 'Sekolah Menengah Kejuruan',
      trim: true,
    },
    logo: {
      type: String, // Cloudinary URL
      default: '',
    },
    logoLight: {
      type: String, // Logo for dark backgrounds
      default: '',
    },
    favicon: {
      type: String,
      default: '',
    },
    ogImage: {
      type: String, // Cloudinary URL - ukuran ideal 1200x630px untuk social media preview
      default: '',
    },

    // Contact Info
    email: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    whatsapp: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },

    // Maps
    googleMapsUrl: {
      type: String,
      default: '',
    },
    googleMapsEmbed: {
      type: String,
      default: '',
    },

    // SEO
    metaTitle: {
      type: String,
      default: '',
      trim: true,
    },
    metaDescription: {
      type: String,
      default: '',
      trim: true,
    },
    metaKeywords: {
      type: String,
      default: '',
      trim: true,
    },

    // Analytics
    googleAnalyticsId: {
      type: String,
      default: '',
      trim: true,
    },

    // Footer
    footerText: {
      type: String,
      default: '© 2024 SMK Kristen 5 Klaten. All rights reserved.',
      trim: true,
    },
    footerDescription: {
      type: String,
      default: '',
      trim: true,
    },

    // Homepage Sections Content
    homepageSections: {
      type: homepageSectionsSchema,
      default: () => ({}),
    },

    // Running Text Display Settings
    runningTextSettings: {
      type: new mongoose.Schema({
        backgroundColor: { type: String, default: '#facc15' },
        textColor: { type: String, default: '#111827' },
        speed: { type: Number, default: 30, min: 5, max: 120 },
      }, { _id: false }),
      default: () => ({ backgroundColor: '#facc15', textColor: '#111827', speed: 30 }),
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists (singleton pattern)
siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);

export default SiteSettings;
