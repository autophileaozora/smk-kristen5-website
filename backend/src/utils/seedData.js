import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import RunningText from '../models/RunningText.js';
import Jurusan from '../models/Jurusan.js';
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
        slug: 'tkj',
        description: '<p>Jurusan TKJ mempelajari tentang instalasi, konfigurasi, dan pemeliharaan jaringan komputer. Siswa akan dibekali dengan keterampilan praktis dalam mengelola infrastruktur IT.</p>',
        shortDescription: 'Jurusan yang mempelajari jaringan komputer dan infrastruktur IT',
        skills: ['Instalasi Jaringan', 'Konfigurasi Server', 'Troubleshooting', 'Keamanan Jaringan', 'Linux & Windows Server'],
        careerProspects: ['Network Administrator', 'IT Support', 'System Administrator', 'Network Engineer', 'IT Consultant'],
        facilities: ['Lab Komputer', 'Lab Jaringan', 'Server Room', 'Cisco Equipment'],
        accreditation: 'A',
        isActive: true,
        displayOrder: 1,
        createdBy: administrator._id,
      },
      {
        name: 'Multimedia',
        slug: 'multimedia',
        description: '<p>Jurusan Multimedia fokus pada pengembangan kreativitas dalam bidang desain grafis, video editing, animasi, dan fotografi. Siswa akan belajar menggunakan software industri terkini.</p>',
        shortDescription: 'Jurusan yang fokus pada desain grafis, video, dan animasi',
        skills: ['Adobe Photoshop', 'Adobe Premiere', 'After Effects', 'Blender 3D', 'Fotografi'],
        careerProspects: ['Graphic Designer', 'Video Editor', 'Animator', 'Photographer', 'Content Creator'],
        facilities: ['Lab Multimedia', 'Studio Fotografi', 'Rendering Farm', 'Green Screen'],
        accreditation: 'A',
        isActive: true,
        displayOrder: 2,
        createdBy: administrator._id,
      },
      {
        name: 'Akuntansi dan Keuangan Lembaga',
        slug: 'akl',
        description: '<p>Jurusan AKL mempersiapkan siswa untuk menjadi tenaga profesional di bidang akuntansi dan keuangan. Materi mencakup pembukuan, perpajakan, dan manajemen keuangan.</p>',
        shortDescription: 'Jurusan yang mempelajari akuntansi dan manajemen keuangan',
        skills: ['Pembukuan', 'Perpajakan', 'Manajemen Keuangan', 'Aplikasi Akuntansi', 'Audit'],
        careerProspects: ['Akuntan', 'Staff Finance', 'Tax Consultant', 'Auditor', 'Bank Teller'],
        facilities: ['Lab Akuntansi', 'Perpustakaan Ekonomi', 'Software Akuntansi'],
        accreditation: 'B',
        isActive: true,
        displayOrder: 3,
        createdBy: administrator._id,
      },
    ]);

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
        author: administrator._id,
        approvedBy: administrator._id,
        publishedAt: new Date(),
      },
      {
        text: 'Libur semester genap: 16-30 Juni 2025. Masuk kembali 1 Juli 2025. Selamat berlibur!',
        status: 'published',
        isActive: true,
        priority: 2,
        author: administrator._id,
        approvedBy: administrator._id,
        publishedAt: new Date(),
      },
      {
        text: 'Selamat kepada siswa yang lolos Beasiswa LPDP dan prestasi juara lomba! Kalian adalah kebanggaan SMK Kristen 5 Klaten',
        status: 'published',
        isActive: true,
        priority: 1,
        author: adminSiswa[1]._id,
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
