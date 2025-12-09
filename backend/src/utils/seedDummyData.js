import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Jurusan from '../models/Jurusan.js';
import MataPelajaran from '../models/MataPelajaran.js';
import Fasilitas from '../models/Fasilitas.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smk-kristen5';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Dummy Jurusan Data
const jurusanData = [
  {
    name: 'Teknik Komputer dan Jaringan',
    code: 'TKJ',
    description: 'Program keahlian yang mempelajari tentang cara instalasi PC, instalasi LAN, membangun dan mengoperasikan jaringan komputer serta mempelajari sistem operasi.',
    vision: 'Menjadi jurusan TKJ yang unggul dalam menghasilkan teknisi jaringan komputer yang profesional dan berakhlak mulia.',
    mission: 'Mengembangkan kompetensi siswa dalam bidang teknologi jaringan komputer dan sistem operasi.',
    headOfDepartment: 'Budi Santoso, S.Kom',
    competencies: ['Networking', 'Hardware', 'Software', 'Troubleshooting', 'Server Management'],
    careerProspects: ['Network Administrator', 'IT Support', 'System Administrator', 'Network Engineer'],
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Rekayasa Perangkat Lunak',
    code: 'RPL',
    description: 'Program keahlian yang mempelajari dan mendalami cara-cara pengembangan perangkat lunak, mulai dari pembuatan, pemeliharaan, hingga manajemen kualitas aplikasi.',
    vision: 'Menjadi jurusan RPL yang menghasilkan programmer handal dan inovatif dengan karakter Kristiani.',
    mission: 'Membekali siswa dengan keterampilan pemrograman dan pengembangan aplikasi modern.',
    headOfDepartment: 'Siti Nurhaliza, S.T',
    competencies: ['Programming', 'Web Development', 'Mobile Development', 'Database', 'UI/UX Design'],
    careerProspects: ['Software Developer', 'Web Developer', 'Mobile App Developer', 'Database Administrator'],
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Akuntansi dan Keuangan Lembaga',
    code: 'AKL',
    description: 'Program keahlian yang mempelajari tentang pencatatan, pengelompokan, dan pelaporan transaksi keuangan perusahaan atau lembaga.',
    vision: 'Menjadi jurusan AKL yang menghasilkan tenaga akuntan profesional dengan integritas tinggi.',
    mission: 'Memberikan pendidikan akuntansi yang komprehensif dan sesuai dengan standar industri.',
    headOfDepartment: 'Ahmad Fauzi, S.E, M.Ak',
    competencies: ['Accounting', 'Financial Analysis', 'Tax Management', 'Auditing', 'Computerized Accounting'],
    careerProspects: ['Accountant', 'Tax Consultant', 'Financial Analyst', 'Auditor'],
    isActive: true,
    displayOrder: 3
  },
  {
    name: 'Otomatisasi dan Tata Kelola Perkantoran',
    code: 'OTKP',
    description: 'Program keahlian yang mempelajari tentang pengelolaan administrasi kantor, kearsipan, korespondensi, dan teknologi perkantoran modern.',
    vision: 'Menjadi jurusan OTKP yang menghasilkan tenaga administrasi profesional dengan kemampuan teknologi perkantoran yang mumpuni.',
    mission: 'Mengembangkan kompetensi siswa dalam bidang administrasi perkantoran dan teknologi informasi.',
    headOfDepartment: 'Sri Wahyuni, S.Pd',
    competencies: ['Office Administration', 'Document Management', 'Communication', 'Office Automation', 'Business Correspondence'],
    careerProspects: ['Administrative Assistant', 'Secretary', 'Office Manager', 'Document Controller'],
    isActive: true,
    displayOrder: 4
  },
  {
    name: 'Bisnis Digital',
    code: 'BD',
    description: 'Program keahlian yang mempelajari tentang pemasaran digital, e-commerce, manajemen media sosial, dan strategi bisnis online.',
    vision: 'Menjadi jurusan Bisnis Digital yang menghasilkan entrepreneur digital yang kreatif dan inovatif.',
    mission: 'Membekali siswa dengan keterampilan digital marketing dan bisnis online yang sesuai dengan perkembangan zaman.',
    headOfDepartment: 'Rini Kartika, S.E',
    competencies: ['Digital Marketing', 'E-Commerce', 'Social Media Management', 'Content Creation', 'SEO'],
    careerProspects: ['Digital Marketer', 'Social Media Specialist', 'E-Commerce Manager', 'Content Creator'],
    isActive: true,
    displayOrder: 5
  },
  {
    name: 'Desain Komunikasi Visual',
    code: 'DKV',
    description: 'Program keahlian yang mempelajari tentang desain grafis, multimedia, animasi, fotografi, dan videografi untuk keperluan komunikasi visual.',
    vision: 'Menjadi jurusan DKV yang menghasilkan desainer grafis profesional dengan kreativitas tinggi dan nilai-nilai Kristiani.',
    mission: 'Mengembangkan bakat seni dan kreativitas siswa dalam bidang desain komunikasi visual.',
    headOfDepartment: 'Denny Prasetyo, S.Sn',
    competencies: ['Graphic Design', 'Photography', 'Videography', 'Animation', '3D Modeling'],
    careerProspects: ['Graphic Designer', 'Photographer', 'Videographer', 'Animator', 'UI/UX Designer'],
    isActive: true,
    displayOrder: 6
  }
];

// Dummy Mata Pelajaran Data
const mataPelajaranData = [
  {
    name: 'Pemrograman Dasar',
    description: 'Mata pelajaran yang mengajarkan konsep dasar pemrograman, algoritma, dan struktur data menggunakan berbagai bahasa pemrograman.',
    category: 'TKJ',
    semester: 1,
    hoursPerWeek: 6,
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Administrasi Infrastruktur Jaringan',
    description: 'Mata pelajaran yang mempelajari tentang instalasi, konfigurasi, dan maintenance infrastruktur jaringan komputer.',
    category: 'TKJ',
    semester: 3,
    hoursPerWeek: 8,
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Pemrograman Web dan Mobile',
    description: 'Mata pelajaran yang mengajarkan pengembangan aplikasi web dan mobile menggunakan framework modern seperti React, React Native, dan Flutter.',
    category: 'RPL',
    semester: 4,
    hoursPerWeek: 10,
    isActive: true,
    displayOrder: 3
  },
  {
    name: 'Praktikum Akuntansi Perusahaan Jasa, Dagang dan Manufaktur',
    description: 'Mata pelajaran praktik yang mengajarkan pencatatan transaksi keuangan untuk berbagai jenis perusahaan.',
    category: 'AKL',
    semester: 3,
    hoursPerWeek: 8,
    isActive: true,
    displayOrder: 4
  },
  {
    name: 'Matematika',
    description: 'Mata pelajaran umum yang mengajarkan konsep matematika dasar hingga lanjutan yang diperlukan untuk kehidupan sehari-hari dan dunia kerja.',
    category: 'PUBLIC',
    semester: 1,
    hoursPerWeek: 4,
    isActive: true,
    displayOrder: 5
  },
  {
    name: 'Bahasa Inggris',
    description: 'Mata pelajaran yang mengajarkan kemampuan berbahasa Inggris baik lisan maupun tulisan untuk komunikasi global.',
    category: 'PUBLIC',
    semester: 1,
    hoursPerWeek: 4,
    isActive: true,
    displayOrder: 6
  }
];

// Dummy Fasilitas Data
const fasilitasData = [
  {
    name: 'Laboratorium Komputer',
    description: 'Ruangan yang dilengkapi dengan 40 unit komputer dengan spesifikasi tinggi untuk praktik programming dan jaringan komputer.',
    category: 'TKJ',
    location: 'Lantai 2, Gedung A',
    capacity: 40,
    isActive: true,
    displayOrder: 1
  },
  {
    name: 'Lab Jaringan dan Server',
    description: 'Laboratorium khusus yang dilengkapi dengan perangkat jaringan seperti router, switch, dan server untuk praktik administrasi jaringan.',
    category: 'TKJ',
    location: 'Lantai 3, Gedung A',
    capacity: 30,
    isActive: true,
    displayOrder: 2
  },
  {
    name: 'Studio Multimedia',
    description: 'Studio yang dilengkapi dengan komputer high-end, kamera profesional, lighting, dan green screen untuk produksi konten multimedia.',
    category: 'DKV',
    location: 'Lantai 2, Gedung B',
    capacity: 25,
    isActive: true,
    displayOrder: 3
  },
  {
    name: 'Perpustakaan Digital',
    description: 'Perpustakaan modern dengan koleksi buku fisik dan digital yang dapat diakses oleh semua siswa dan guru.',
    category: 'PUBLIC',
    location: 'Lantai 1, Gedung C',
    capacity: 100,
    isActive: true,
    displayOrder: 4
  },
  {
    name: 'Aula Serbaguna',
    description: 'Ruangan luas yang dapat digunakan untuk berbagai kegiatan seperti seminar, workshop, dan acara sekolah.',
    category: 'PUBLIC',
    location: 'Lantai 1, Gedung Utama',
    capacity: 500,
    isActive: true,
    displayOrder: 5
  },
  {
    name: 'Lapangan Olahraga',
    description: 'Lapangan outdoor yang dilengkapi dengan fasilitas untuk berbagai cabang olahraga seperti basket, voli, dan futsal.',
    category: 'PUBLIC',
    location: 'Area Outdoor',
    capacity: 200,
    isActive: true,
    displayOrder: 6
  }
];

// Main seed function
const seedDummyData = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting to seed dummy data...\n');

    // Get admin user (required for createdBy field)
    const adminUser = await User.findOne({ role: 'administrator' });

    if (!adminUser) {
      console.error('❌ Admin user not found! Please create an admin user first.');
      process.exit(1);
    }

    console.log('✅ Found admin user:', adminUser.name);

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Jurusan.deleteMany({});
    await MataPelajaran.deleteMany({});
    await Fasilitas.deleteMany({});
    console.log('✅ Existing data cleared');

    // Seed Jurusan
    console.log('\n📚 Seeding Jurusan data...');
    const jurusanPromises = jurusanData.map(jurusan =>
      Jurusan.create({ ...jurusan, createdBy: adminUser._id })
    );
    const createdJurusans = await Promise.all(jurusanPromises);
    console.log(`✅ Created ${createdJurusans.length} jurusan records`);

    // Seed Mata Pelajaran
    console.log('\n📖 Seeding Mata Pelajaran data...');
    const mataPelajaranPromises = mataPelajaranData.map(mp =>
      MataPelajaran.create({ ...mp, createdBy: adminUser._id })
    );
    const createdMataPelajaran = await Promise.all(mataPelajaranPromises);
    console.log(`✅ Created ${createdMataPelajaran.length} mata pelajaran records`);

    // Seed Fasilitas
    console.log('\n🏢 Seeding Fasilitas data...');
    const fasilitasPromises = fasilitasData.map(f =>
      Fasilitas.create({ ...f, createdBy: adminUser._id })
    );
    const createdFasilitas = await Promise.all(fasilitasPromises);
    console.log(`✅ Created ${createdFasilitas.length} fasilitas records`);

    console.log('\n✨ Dummy data seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Jurusan: ${createdJurusans.length} records`);
    console.log(`   - Mata Pelajaran: ${createdMataPelajaran.length} records`);
    console.log(`   - Fasilitas: ${createdFasilitas.length} records`);
    console.log('\n✅ All done!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDummyData();
