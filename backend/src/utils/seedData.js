import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import RunningText from '../models/RunningText.js';
import Jurusan from '../models/Jurusan.js';
import Ekskul from '../models/Ekskul.js';
import Fasilitas from '../models/Fasilitas.js';
import Partner from '../models/Partner.js';
import Alumni from '../models/Alumni.js';
import Contact from '../models/Contact.js';
import connectDB from '../config/database.js';

// Load env vars
dotenv.config();

// Sample data
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Article.deleteMany({});
    await RunningText.deleteMany({});
    await Jurusan.deleteMany({});
    await Ekskul.deleteMany({});
    await Fasilitas.deleteMany({});
    await Partner.deleteMany({});
    await Alumni.deleteMany({});

    // Create Administrator
    console.log('👤 Creating users...');
    const administrator = await User.create({
      name: 'Administrator',
      email: 'admin@smk.com',
      password: 'Admin123!',
      role: 'administrator',
    });

    // Create 7 Admin Siswa
    const adminSiswa = [];
    for (let i = 1; i <= 7; i++) {
      const siswa = await User.create({
        name: `Admin Siswa ${i}`,
        email: `siswa${i}@smk.com`,
        password: 'Siswa123!',
        role: 'admin_siswa',
      });
      adminSiswa.push(siswa);
    }

    console.log(`✅ Created 1 Administrator + 7 Admin Siswa`);

    // Create Categories - Jurusan
    console.log('📁 Creating categories...');
    const jurusanCategories = await Category.create([
      {
        name: 'Teknik Komputer dan Jaringan',
        type: 'jurusan',
        slug: 'tkj',
        description: 'Jurusan yang mempelajari tentang jaringan komputer, server, dan infrastruktur IT',
        createdBy: administrator._id,
      },
      {
        name: 'Multimedia',
        type: 'jurusan',
        slug: 'multimedia',
        description: 'Jurusan yang fokus pada desain grafis, video editing, dan animasi',
        createdBy: administrator._id,
      },
      {
        name: 'Akuntansi dan Keuangan Lembaga',
        type: 'jurusan',
        slug: 'akl',
        description: 'Jurusan yang mempelajari akuntansi, pembukuan, dan manajemen keuangan',
        createdBy: administrator._id,
      },
    ]);

    // Create Categories - Topik
    const topikCategories = await Category.create([
      {
        name: 'Prestasi',
        type: 'topik',
        slug: 'prestasi',
        description: 'Artikel tentang prestasi siswa dan sekolah',
        createdBy: administrator._id,
      },
      {
        name: 'Kegiatan',
        type: 'topik',
        slug: 'kegiatan',
        description: 'Artikel tentang kegiatan sekolah',
        createdBy: administrator._id,
      },
      {
        name: 'Pengumuman',
        type: 'topik',
        slug: 'pengumuman',
        description: 'Pengumuman penting sekolah',
        createdBy: administrator._id,
      },
    ]);

    console.log(`✅ Created ${jurusanCategories.length} Jurusan + ${topikCategories.length} Topik categories`);

    // Create Sample Jurusan (Master Data)
    console.log('🎓 Creating jurusan data...');
    await Jurusan.create([
      {
        name: 'Teknik Komputer dan Jaringan',
        code: 'TKJ',
        description: '<p>Jurusan TKJ mempelajari tentang instalasi, konfigurasi, dan pemeliharaan jaringan komputer. Siswa akan dibekali dengan keterampilan praktis dalam mengelola infrastruktur IT.</p>',
        vision: 'Menjadi jurusan unggulan yang menghasilkan lulusan kompeten di bidang jaringan komputer',
        mission: 'Mengembangkan kompetensi siswa dalam teknologi jaringan dan infrastruktur IT',
        headOfDepartment: 'Budi Santoso, S.Kom',
        competencies: ['Instalasi Jaringan', 'Konfigurasi Server', 'Troubleshooting', 'Keamanan Jaringan', 'Linux & Windows Server'],
        careerProspects: ['Network Administrator', 'IT Support', 'System Administrator', 'Network Engineer', 'IT Consultant'],
        facilities: [
          { name: 'Lab Komputer', description: 'Laboratorium dengan 40 unit komputer' },
          { name: 'Lab Jaringan', description: 'Lab khusus praktik jaringan' },
          { name: 'Server Room', description: 'Ruang server untuk praktik' }
        ],
        isActive: true,
        displayOrder: 1,
        createdBy: administrator._id,
      },
      {
        name: 'Multimedia',
        code: 'MM',
        description: '<p>Jurusan Multimedia fokus pada pengembangan kreativitas dalam bidang desain grafis, video editing, animasi, dan fotografi. Siswa akan belajar menggunakan software industri terkini.</p>',
        vision: 'Menjadi jurusan yang menghasilkan kreator konten digital yang profesional',
        mission: 'Membekali siswa dengan keterampilan desain dan multimedia modern',
        headOfDepartment: 'Denny Prasetyo, S.Sn',
        competencies: ['Adobe Photoshop', 'Adobe Premiere', 'After Effects', 'Blender 3D', 'Fotografi'],
        careerProspects: ['Graphic Designer', 'Video Editor', 'Animator', 'Photographer', 'Content Creator'],
        facilities: [
          { name: 'Lab Multimedia', description: 'Lab dengan komputer spesifikasi tinggi' },
          { name: 'Studio Fotografi', description: 'Studio lengkap dengan lighting' },
          { name: 'Green Screen', description: 'Area green screen untuk produksi video' }
        ],
        isActive: true,
        displayOrder: 2,
        createdBy: administrator._id,
      },
      {
        name: 'Akuntansi dan Keuangan Lembaga',
        code: 'AKL',
        description: '<p>Jurusan AKL mempersiapkan siswa untuk menjadi tenaga profesional di bidang akuntansi dan keuangan. Materi mencakup pembukuan, perpajakan, dan manajemen keuangan.</p>',
        vision: 'Menjadi jurusan yang menghasilkan tenaga akuntansi profesional',
        mission: 'Memberikan pendidikan akuntansi yang komprehensif sesuai standar industri',
        headOfDepartment: 'Ahmad Fauzi, S.E, M.Ak',
        competencies: ['Pembukuan', 'Perpajakan', 'Manajemen Keuangan', 'Aplikasi Akuntansi', 'Audit'],
        careerProspects: ['Akuntan', 'Staff Finance', 'Tax Consultant', 'Auditor', 'Bank Teller'],
        facilities: [
          { name: 'Lab Akuntansi', description: 'Lab dengan software akuntansi terkini' },
          { name: 'Perpustakaan Ekonomi', description: 'Koleksi buku ekonomi dan akuntansi' }
        ],
        isActive: true,
        displayOrder: 3,
        createdBy: administrator._id,
      },
    ]);

    // Create Sample Ekskul
    console.log('🏃 Creating ekskul data...');
    await Ekskul.create([
      {
        name: 'Basket',
        description: 'Ekstrakurikuler basket untuk mengembangkan kemampuan olahraga dan kerja sama tim.',
        category: 'olahraga',
        coach: 'Pak Andi Setiawan',
        schedule: 'Selasa & Kamis, 15:00-17:00',
        location: 'Lapangan Basket Sekolah',
        achievements: 'Juara 2 Turnamen Basket Antar SMK Kabupaten Klaten 2024',
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Paduan Suara',
        description: 'Ekstrakurikuler paduan suara untuk mengembangkan bakat menyanyi dan seni musik.',
        category: 'seni',
        coach: 'Ibu Maria Kristina',
        schedule: 'Senin & Rabu, 14:00-16:00',
        location: 'Ruang Musik',
        achievements: 'Juara 1 Festival Paduan Suara Rohani Se-Jawa Tengah 2024',
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'English Club',
        description: 'Klub bahasa Inggris untuk meningkatkan kemampuan berbahasa Inggris siswa.',
        category: 'akademik',
        coach: 'Mr. David Hartono',
        schedule: 'Jumat, 14:00-16:00',
        location: 'Lab Bahasa',
        achievements: 'Finalis English Debate Competition 2024',
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Rohani Kristen',
        description: 'Kegiatan kerohanian untuk mendalami iman Kristiani dan pelayanan.',
        category: 'keagamaan',
        coach: 'Pdt. Yohanes Surya',
        schedule: 'Sabtu, 08:00-10:00',
        location: 'Aula Sekolah',
        achievements: 'Aktif dalam pelayanan gereja dan masyarakat',
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Programming Club',
        description: 'Klub pemrograman untuk siswa yang tertarik dengan coding dan teknologi.',
        category: 'teknologi',
        coach: 'Pak Budi Santoso, S.Kom',
        schedule: 'Rabu & Jumat, 15:00-17:00',
        location: 'Lab Komputer 1',
        achievements: 'Juara 3 Hackathon Pelajar Jawa Tengah 2024',
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Pramuka',
        description: 'Kegiatan kepramukaan untuk membentuk karakter dan jiwa kepemimpinan.',
        category: 'lainnya',
        coach: 'Kak Teguh Prasetyo',
        schedule: 'Sabtu, 13:00-16:00',
        location: 'Lapangan Sekolah',
        achievements: 'Penggalang Terbaik Tingkat Kabupaten 2024',
        isActive: true,
        createdBy: administrator._id,
      },
    ]);
    console.log('✅ Created 6 ekskul records');

    // Create Sample Fasilitas
    console.log('🏢 Creating fasilitas data...');
    await Fasilitas.create([
      {
        name: 'Laboratorium Komputer',
        description: 'Laboratorium dengan 40 unit komputer spesifikasi tinggi untuk praktik siswa TKJ dan MM.',
        category: 'TKJ',
        location: 'Gedung A, Lantai 2',
        capacity: 40,
        isActive: true,
        displayOrder: 1,
        createdBy: administrator._id,
      },
      {
        name: 'Lab Jaringan',
        description: 'Lab khusus untuk praktik instalasi dan konfigurasi jaringan komputer.',
        category: 'TKJ',
        location: 'Gedung A, Lantai 3',
        capacity: 30,
        isActive: true,
        displayOrder: 2,
        createdBy: administrator._id,
      },
      {
        name: 'Studio Multimedia',
        description: 'Studio lengkap dengan green screen, lighting, dan peralatan produksi video.',
        category: 'MM',
        location: 'Gedung B, Lantai 2',
        capacity: 25,
        isActive: true,
        displayOrder: 3,
        createdBy: administrator._id,
      },
      {
        name: 'Lab Akuntansi',
        description: 'Laboratorium dengan software akuntansi MYOB, Accurate, dan Zahir.',
        category: 'AKL',
        location: 'Gedung C, Lantai 1',
        capacity: 35,
        isActive: true,
        displayOrder: 4,
        createdBy: administrator._id,
      },
      {
        name: 'Perpustakaan',
        description: 'Perpustakaan dengan koleksi lebih dari 5000 buku dan akses e-library.',
        category: 'PUBLIC',
        location: 'Gedung Utama, Lantai 1',
        capacity: 100,
        isActive: true,
        displayOrder: 5,
        createdBy: administrator._id,
      },
      {
        name: 'Aula Serbaguna',
        description: 'Aula dengan kapasitas 500 orang untuk kegiatan sekolah dan acara besar.',
        category: 'PUBLIC',
        location: 'Gedung Utama',
        capacity: 500,
        isActive: true,
        displayOrder: 6,
        createdBy: administrator._id,
      },
      {
        name: 'Lapangan Olahraga',
        description: 'Lapangan outdoor untuk basket, voli, dan futsal.',
        category: 'PUBLIC',
        location: 'Area Outdoor',
        capacity: 200,
        isActive: true,
        displayOrder: 7,
        createdBy: administrator._id,
      },
      {
        name: 'Ruang UKS',
        description: 'Unit Kesehatan Sekolah dengan fasilitas P3K dan tempat istirahat.',
        category: 'PUBLIC',
        location: 'Gedung Utama, Lantai 1',
        capacity: 10,
        isActive: true,
        displayOrder: 8,
        createdBy: administrator._id,
      },
    ]);
    console.log('✅ Created 8 fasilitas records');

    // Create Sample Partners (Companies that hired alumni)
    console.log('🏢 Creating partner data...');
    await Partner.create([
      {
        name: 'PT Telkom Indonesia',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Logo_Telkom_Indonesia_%282013%29.svg/2560px-Logo_Telkom_Indonesia_%282013%29.svg.png',
        startYear: 2020,
        location: 'Jakarta',
        description: 'Perusahaan telekomunikasi terbesar di Indonesia',
        order: 1,
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Bank BCA',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/2560px-Bank_Central_Asia.svg.png',
        startYear: 2019,
        location: 'Jakarta',
        description: 'Bank swasta terbesar di Indonesia',
        order: 2,
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Astra Honda Motor',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Logo_Honda.svg/2048px-Logo_Honda.svg.png',
        startYear: 2018,
        location: 'Jakarta',
        description: 'Produsen sepeda motor terbesar di Indonesia',
        order: 3,
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Tokopedia',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Tokopedia_logo_2022.svg/1280px-Tokopedia_logo_2022.svg.png',
        startYear: 2021,
        location: 'Jakarta',
        description: 'E-commerce terkemuka di Indonesia',
        order: 4,
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Gojek',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Gojek_logo_2022.svg/2560px-Gojek_logo_2022.svg.png',
        startYear: 2022,
        location: 'Jakarta',
        description: 'Super app transportasi dan layanan on-demand',
        order: 5,
        isActive: true,
        createdBy: administrator._id,
      },
      {
        name: 'Bank Mandiri',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Bank_Mandiri_logo_2016.svg/2560px-Bank_Mandiri_logo_2016.svg.png',
        startYear: 2019,
        location: 'Jakarta',
        description: 'Bank BUMN terbesar di Indonesia',
        order: 6,
        isActive: true,
        createdBy: administrator._id,
      },
    ]);
    console.log('✅ Created 6 partner records');

    // Create Sample Alumni (with testimonials)
    console.log('👨‍🎓 Creating alumni data...');
    await Alumni.create([
      {
        name: 'Budi Setiawan',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        graduationYear: 2020,
        jurusan: 'TKJ',
        currentOccupation: 'Network Administrator',
        company: 'PT Telkom Indonesia',
        testimonial: 'SMK Kristen 5 Klaten memberikan fondasi yang kuat untuk karir saya di bidang IT. Guru-guru yang kompeten dan fasilitas lab yang lengkap sangat membantu saya menguasai jaringan komputer.',
        isPublished: true,
        isFeatured: true,
        createdBy: administrator._id,
      },
      {
        name: 'Sari Dewi',
        photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
        graduationYear: 2019,
        jurusan: 'AKL',
        currentOccupation: 'Senior Accountant',
        company: 'Bank BCA',
        testimonial: 'Ilmu akuntansi yang saya dapat di SMK Kristen 5 Klaten sangat aplikatif. Sekarang saya bekerja di salah satu bank terbesar di Indonesia berkat bekal dari sekolah.',
        isPublished: true,
        isFeatured: true,
        createdBy: administrator._id,
      },
      {
        name: 'Andi Pratama',
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        graduationYear: 2021,
        jurusan: 'MM',
        currentOccupation: 'Video Editor',
        company: 'Gojek',
        testimonial: 'Kreativitas saya diasah dengan baik di jurusan Multimedia. Sekarang saya bisa berkarir di industri kreatif digital yang sangat saya cintai.',
        isPublished: true,
        isFeatured: true,
        createdBy: administrator._id,
      },
      {
        name: 'Rina Kartika',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
        graduationYear: 2018,
        jurusan: 'TKJ',
        currentOccupation: 'IT Support Manager',
        company: 'Astra Honda Motor',
        university: 'Universitas Gadjah Mada',
        testimonial: 'Dari SMK Kristen 5 Klaten, saya melanjutkan kuliah sambil bekerja. Sekarang saya sudah menjadi manager di perusahaan otomotif ternama.',
        isPublished: true,
        isFeatured: true,
        createdBy: administrator._id,
      },
      {
        name: 'Dimas Nugroho',
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
        graduationYear: 2022,
        jurusan: 'MM',
        currentOccupation: 'UI/UX Designer',
        company: 'Tokopedia',
        testimonial: 'Skill desain yang saya pelajari di SMK sangat relevan dengan industri. Lab multimedia yang lengkap membuat saya siap terjun ke dunia kerja.',
        isPublished: true,
        isFeatured: true,
        createdBy: administrator._id,
      },
      {
        name: 'Putri Handayani',
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
        graduationYear: 2020,
        jurusan: 'AKL',
        currentOccupation: 'Tax Consultant',
        company: 'PwC Indonesia',
        testimonial: 'Pendidikan karakter Kristiani dan ilmu akuntansi yang solid dari SMK Kristen 5 Klaten membentuk saya menjadi profesional yang berintegritas.',
        isPublished: true,
        isFeatured: true,
        createdBy: administrator._id,
      },
    ]);
    console.log('✅ Created 6 alumni records');

    // Update Contact with school logo
    console.log('📞 Updating contact with school logo...');
    await Contact.findOneAndUpdate(
      { isCurrent: true },
      {
        schoolLogo: 'https://res.cloudinary.com/drszo9bl2/image/upload/v1735530809/smk-kristen5/logo_sekolah.png'
      },
      { upsert: false }
    );
    console.log('✅ Contact updated with school logo');

    // Create Sample Articles
    console.log('📝 Creating sample articles...');
    const articles = [
      {
        title: 'Siswa TKJ Juara 1 Lomba Jaringan Komputer Se-Jawa Tengah',
        content: '<p>SMK Kristen 5 Klaten kembali mengharumkan nama sekolah dengan meraih juara 1 dalam Lomba Jaringan Komputer tingkat Jawa Tengah. Tim yang terdiri dari 3 siswa kelas XII TKJ berhasil mengalahkan 25 sekolah pesaing.</p><p>Lomba yang diselenggarakan di Universitas Sebelas Maret Solo ini menguji kemampuan siswa dalam merancang dan mengkonfigurasi jaringan komputer kompleks. Para peserta harus menyelesaikan berbagai kasus troubleshooting dan optimasi jaringan dalam waktu terbatas.</p><p>"Kami sangat bangga dengan prestasi ini. Ini membuktikan bahwa kualitas pendidikan TKJ di sekolah kami setara dengan sekolah-sekolah terbaik di Jawa Tengah," ujar Kepala Sekolah dalam sambutannya.</p>',
        excerpt: 'Tim TKJ berhasil meraih juara 1 dalam lomba jaringan komputer tingkat Jawa Tengah',
        categoryJurusan: jurusanCategories[0]._id, // TKJ
        categoryTopik: topikCategories[0]._id, // Prestasi
        status: 'published',
        author: adminSiswa[0]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-01'),
        tags: ['prestasi', 'tkj', 'lomba'],
      },
      {
        title: 'Workshop Digital Marketing bersama Praktisi Industri',
        content: '<p>SMK Kristen 5 Klaten mengadakan workshop Digital Marketing yang diikuti oleh seluruh siswa kelas XI dan XII. Workshop ini menghadirkan praktisi dari Google Indonesia dan beberapa digital agency ternama.</p><p>Materi yang disampaikan meliputi SEO, SEM, Social Media Marketing, Content Strategy, dan Google Analytics. Para siswa sangat antusias mengikuti sesi praktek langsung membuat kampanye digital.</p><p>Workshop ini merupakan bagian dari program link and match sekolah dengan dunia industri, untuk memastikan siswa memiliki keterampilan yang relevan dengan kebutuhan pasar kerja.</p>',
        excerpt: 'Siswa mengikuti workshop digital marketing dengan praktisi dari Google Indonesia',
        categoryJurusan: null, // Umum (semua jurusan)
        categoryTopik: topikCategories[1]._id, // Kegiatan
        status: 'published',
        author: adminSiswa[1]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-05'),
        tags: ['workshop', 'digital marketing'],
      },
      {
        title: 'Kunjungan Industri ke PT. Astra Honda Motor',
        content: '<p>Siswa kelas XII TKJ dan Multimedia melaksanakan kunjungan industri ke PT. Astra Honda Motor, salah satu perusahaan otomotif terbesar di Indonesia. Kunjungan ini bertujuan memberikan gambaran langsung tentang penerapan teknologi di industri.</p><p>Para siswa berkesempatan melihat proses produksi yang telah terintegrasi dengan sistem otomasi dan IoT. Mereka juga diajak berdiskusi dengan tim IT perusahaan tentang career path di bidang teknologi.</p><p>"Pengalaman ini sangat berharga. Kami jadi tahu bahwa ilmu yang kami pelajari di sekolah benar-benar dibutuhkan di industri," ungkap salah satu siswa peserta.</p>',
        excerpt: 'Siswa TKJ dan MM mengunjungi pabrik Astra Honda Motor untuk melihat penerapan teknologi',
        categoryJurusan: jurusanCategories[0]._id, // TKJ
        categoryTopik: topikCategories[1]._id, // Kegiatan
        status: 'published',
        author: adminSiswa[2]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-10'),
        tags: ['kunjungan industri', 'tkj', 'multimedia'],
      },
      {
        title: 'Pendaftaran PPDB Tahun Ajaran 2025/2026 Dibuka',
        content: '<p>SMK Kristen 5 Klaten membuka pendaftaran peserta didik baru (PPDB) untuk tahun ajaran 2025/2026. Pendaftaran dapat dilakukan secara online melalui website sekolah atau datang langsung ke sekolah.</p><p><strong>Jurusan yang dibuka:</strong></p><ul><li>Teknik Komputer dan Jaringan (TKJ)</li><li>Multimedia (MM)</li><li>Akuntansi dan Keuangan Lembaga (AKL)</li></ul><p><strong>Jadwal Pendaftaran:</strong><br>1 Desember 2024 - 31 Januari 2025</p><p><strong>Persyaratan:</strong></p><ul><li>Ijazah SMP/MTs atau Surat Keterangan Lulus</li><li>Fotokopi Kartu Keluarga</li><li>Fotokopi Akta Kelahiran</li><li>Pas foto 3x4 (3 lembar)</li></ul><p>Untuk informasi lebih lanjut, hubungi panitia PPDB di nomor 0812-3456-7890.</p>',
        excerpt: 'PPDB 2025/2026 dibuka mulai 1 Desember 2024 untuk 3 jurusan',
        categoryJurusan: null, // Umum
        categoryTopik: topikCategories[2]._id, // Pengumuman
        status: 'published',
        author: administrator._id,
        publishedAt: new Date('2024-11-15'),
        tags: ['ppdb', 'pendaftaran'],
      },
      {
        title: 'Kegiatan Bakti Sosial di Panti Asuhan Kasih Ibu',
        content: '<p>OSIS SMK Kristen 5 Klaten mengadakan kegiatan bakti sosial ke Panti Asuhan Kasih Ibu, Klaten. Kegiatan ini diikuti oleh 50 siswa yang membawa donasi berupa sembako, pakaian layak pakai, dan perlengkapan sekolah.</p><p>Selain menyerahkan donasi, para siswa juga mengadakan kegiatan bersama anak-anak panti seperti games, menyanyi, dan berbagi cerita. Kegiatan ini mendapat sambutan hangat dari pengurus panti.</p><p>"Kami ingin mengajarkan siswa untuk peduli terhadap sesama. Kegiatan seperti ini akan terus kami lakukan secara rutin," kata pembina OSIS.</p>',
        excerpt: 'OSIS mengadakan bakti sosial dengan menyalurkan donasi ke panti asuhan',
        categoryJurusan: null, // Umum
        categoryTopik: topikCategories[1]._id, // Kegiatan
        status: 'published',
        author: adminSiswa[3]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-18'),
        tags: ['bakti sosial', 'osis'],
      },
      {
        title: 'Tips Sukses PKL dari Alumni Angkatan 2023',
        content: '<p>Dalam rangka mempersiapkan siswa kelas XI yang akan melaksanakan Praktik Kerja Lapangan (PKL), sekolah mengadakan sharing session bersama alumni angkatan 2023 yang telah sukses berkarir di berbagai perusahaan.</p><p>Para alumni berbagi tips dan pengalaman mereka selama PKL, mulai dari cara beradaptasi di lingkungan kerja, membangun networking, hingga memanfaatkan PKL sebagai batu loncatan karir.</p><p><strong>Tips dari Alumni:</strong></p><ul><li>Datang tepat waktu dan tunjukkan attitude positif</li><li>Jangan takut bertanya dan belajar hal baru</li><li>Manfaatkan kesempatan untuk networking</li><li>Dokumentasikan setiap project yang dikerjakan</li><li>Minta feedback dari pembimbing industri</li></ul>',
        excerpt: 'Alumni membagikan tips sukses PKL kepada siswa kelas XI',
        categoryJurusan: null, // Umum
        categoryTopik: topikCategories[1]._id, // Kegiatan
        status: 'published',
        author: adminSiswa[4]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-20'),
        tags: ['pkl', 'alumni', 'tips'],
      },
      {
        title: 'Siswa Multimedia Juara Desain Poster Hari Pahlawan',
        content: '<p>Prestasi membanggakan kembali diraih siswa Multimedia SMK Kristen 5 Klaten. Dalam lomba desain poster Hari Pahlawan tingkat kabupaten, siswa kami berhasil meraih juara 1, 2, dan 3.</p><p>Lomba yang diselenggarakan oleh Dinas Pendidikan Kabupaten Klaten ini diikuti oleh 45 peserta dari berbagai sekolah. Tema yang diusung adalah "Pahlawan Modern: Inspirasi untuk Generasi Muda".</p><p>Karya-karya siswa kami dinilai unggul dalam hal konsep, komposisi warna, dan pesan yang disampaikan. Para juri juga memuji teknik digital illustration yang diterapkan.</p>',
        excerpt: 'Siswa MM meraih juara 1, 2, dan 3 dalam lomba desain poster Hari Pahlawan',
        categoryJurusan: jurusanCategories[1]._id, // Multimedia
        categoryTopik: topikCategories[0]._id, // Prestasi
        status: 'published',
        author: adminSiswa[5]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-22'),
        tags: ['prestasi', 'multimedia', 'lomba desain'],
      },
      {
        title: 'Libur Semester Genap dan Persiapan UAS',
        content: '<p>Kepada seluruh siswa dan orang tua/wali, kami sampaikan informasi mengenai jadwal libur semester genap dan persiapan Ujian Akhir Semester (UAS).</p><p><strong>Jadwal UAS:</strong><br>1 - 15 Juni 2025</p><p><strong>Libur Semester:</strong><br>16 Juni - 30 Juni 2025</p><p><strong>Masuk Tahun Ajaran Baru:</strong><br>1 Juli 2025</p><p>Siswa diharapkan mempersiapkan diri dengan baik untuk UAS. Bagi siswa yang membutuhkan bimbingan tambahan, sekolah menyediakan kelas remedial setiap hari Sabtu mulai pukul 08.00.</p><p>Pengambilan rapor akan dilaksanakan pada tanggal 17 Juni 2025. Orang tua/wali diharapkan hadir untuk konsultasi dengan wali kelas.</p>',
        excerpt: 'Informasi jadwal UAS dan libur semester genap 2025',
        categoryJurusan: null, // Umum
        categoryTopik: topikCategories[2]._id, // Pengumuman
        status: 'published',
        author: administrator._id,
        publishedAt: new Date('2024-11-23'),
        tags: ['pengumuman', 'uas', 'libur'],
      },
      {
        title: 'Pelatihan Sertifikasi BNSP untuk Siswa Kelas XII',
        content: '<p>SMK Kristen 5 Klaten bekerja sama dengan Badan Nasional Sertifikasi Profesi (BNSP) menyelenggarakan pelatihan dan ujian sertifikasi kompetensi untuk siswa kelas XII. Sertifikasi ini penting sebagai bukti kompetensi yang diakui industri.</p><p><strong>Skema Sertifikasi yang tersedia:</strong></p><ul><li>TKJ: Network Administrator (BNSP)</li><li>Multimedia: Junior Graphic Designer (BNSP)</li><li>AKL: Junior Accountant (BNSP)</li></ul><p>Pelatihan akan dilaksanakan selama 2 minggu, dilanjutkan dengan uji kompetensi oleh asesor BNSP. Biaya pelatihan ditanggung sepenuhnya oleh sekolah sebagai bagian dari program pengembangan kompetensi siswa.</p><p>Siswa yang lulus ujian akan mendapatkan sertifikat kompetensi yang berlaku nasional dan diakui oleh dunia industri.</p>',
        excerpt: 'Sekolah menyelenggarakan pelatihan dan sertifikasi BNSP untuk siswa kelas XII',
        categoryJurusan: null, // Umum
        categoryTopik: topikCategories[1]._id, // Kegiatan
        status: 'published',
        author: adminSiswa[6]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-24'),
        tags: ['sertifikasi', 'bnsp', 'kompetensi'],
      },
      {
        title: 'Siswa AKL Lolos Beasiswa LPDP untuk Kuliah',
        content: '<p>Kabar membanggakan datang dari alumni SMK Kristen 5 Klaten. Seorang lulusan jurusan Akuntansi dan Keuangan Lembaga angkatan 2023 berhasil lolos seleksi Beasiswa LPDP untuk melanjutkan kuliah S1 Akuntansi di Universitas Gadjah Mada.</p><p>Prestasi ini sangat membanggakan mengingat seleksi beasiswa LPDP sangat ketat dan kompetitif. Alumni tersebut berhasil melewati tahapan seleksi administrasi, tes tertulis, hingga wawancara.</p><p>"Saya sangat bersyukur mendapat kesempatan ini. Terima kasih kepada guru-guru SMK Kristen 5 yang telah membimbing saya. Ilmu yang saya dapat di SMK menjadi fondasi kuat untuk melanjutkan pendidikan," ungkap alumni tersebut.</p><p>Prestasi ini membuktikan bahwa lulusan SMK memiliki peluang yang sama untuk meraih pendidikan tinggi berkualitas melalui jalur beasiswa.</p>',
        excerpt: 'Alumni jurusan AKL berhasil lolos seleksi Beasiswa LPDP untuk kuliah di UGM',
        categoryJurusan: jurusanCategories[2]._id, // AKL
        categoryTopik: topikCategories[0]._id, // Prestasi
        status: 'published',
        author: adminSiswa[0]._id,
        approvedBy: administrator._id,
        publishedAt: new Date('2024-11-25'),
        tags: ['prestasi', 'beasiswa', 'lpdp', 'alumni'],
      },
    ];

    await Article.create(articles);
    console.log(`✅ Created ${articles.length} sample articles`);

    // Create Sample Running Texts
    console.log('📢 Creating sample running texts...');
    const runningTexts = [
      {
        text: 'Pendaftaran PPDB 2025/2026 dibuka! Info lengkap: wa.me/6281234567890 atau kunjungi website kami',
        status: 'published',
        isActive: true,
        priority: 3,
        createdBy: administrator._id,
        approvedBy: administrator._id,
        publishedAt: new Date(),
      },
      {
        text: 'Libur semester genap: 16-30 Juni 2025. Masuk kembali 1 Juli 2025. Selamat berlibur!',
        status: 'published',
        isActive: true,
        priority: 2,
        createdBy: administrator._id,
        approvedBy: administrator._id,
        publishedAt: new Date(),
      },
      {
        text: 'Selamat kepada siswa yang lolos Beasiswa LPDP dan prestasi juara lomba! Kalian adalah kebanggaan SMK Kristen 5 Klaten',
        status: 'published',
        isActive: true,
        priority: 1,
        createdBy: adminSiswa[1]._id,
        approvedBy: administrator._id,
        publishedAt: new Date(),
      },
    ];

    await RunningText.create(runningTexts);
    console.log(`✅ Created ${runningTexts.length} sample running texts`);

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Administrator:');
    console.log('  Email: admin@smk.com');
    console.log('  Password: Admin123!');
    console.log('\nAdmin Siswa (7 accounts):');
    console.log('  Email: siswa1@smk.com - siswa7@smk.com');
    console.log('  Password: Siswa123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();
