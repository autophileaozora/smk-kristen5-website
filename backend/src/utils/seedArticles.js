import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Article from '../models/Article.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Jurusan from '../models/Jurusan.js';

dotenv.config();

const seedArticles = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Get admin user
    const adminUser = await User.findOne({ role: 'administrator' });
    if (!adminUser) {
      console.error('❌ Admin user not found. Please create an admin user first.');
      process.exit(1);
    }

    // Get all jurusan
    const jurusans = await Jurusan.find();
    if (jurusans.length === 0) {
      console.error('❌ No jurusan found. Please seed jurusan data first.');
      process.exit(1);
    }

    console.log(`\n📚 Found ${jurusans.length} jurusan`);

    // Helper function to generate slug
    const generateSlug = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    // Create topik categories if not exist
    const topikCategories = [
      { name: 'Prestasi', type: 'topik', description: 'Artikel tentang prestasi siswa dan sekolah' },
      { name: 'Kegiatan', type: 'topik', description: 'Artikel tentang kegiatan sekolah' },
      { name: 'Teknologi', type: 'topik', description: 'Artikel tentang perkembangan teknologi' },
      { name: 'Berita', type: 'topik', description: 'Berita terkini sekolah' },
    ];

    console.log('\n📝 Creating topik categories...');
    const createdTopikCategories = [];
    for (const cat of topikCategories) {
      let category = await Category.findOne({ name: cat.name, type: 'topik' });
      if (!category) {
        category = await Category.create({
          ...cat,
          slug: generateSlug(cat.name),
          createdBy: adminUser._id
        });
        console.log(`   ✅ Created topik category: ${category.name}`);
      } else {
        console.log(`   ℹ️  Topik category already exists: ${category.name}`);
      }
      createdTopikCategories.push(category);
    }

    // Create jurusan categories based on existing jurusan
    console.log('\n📝 Creating jurusan categories...');
    const createdJurusanCategories = [];
    for (const jurusan of jurusans) {
      let category = await Category.findOne({ name: jurusan.code, type: 'jurusan' });
      if (!category) {
        category = await Category.create({
          name: jurusan.code,
          slug: generateSlug(jurusan.code),
          type: 'jurusan',
          description: `Kategori artikel untuk jurusan ${jurusan.name}`,
          createdBy: adminUser._id
        });
        console.log(`   ✅ Created jurusan category: ${category.name}`);
      } else {
        console.log(`   ℹ️  Jurusan category already exists: ${category.name}`);
      }
      createdJurusanCategories.push(category);
    }

    // Article templates for each jurusan
    const articleTemplates = [
      {
        titleTemplate: 'Prestasi Gemilang Siswa {jurusan} dalam Kompetisi Nasional',
        content: `<p>Siswa-siswi {jurusan_full} SMK Kristen 5 Klaten kembali mengukir prestasi gemilang di ajang kompetisi nasional. Dengan kerja keras dan dedikasi yang tinggi, mereka berhasil meraih juara dalam berbagai kategori lomba.</p>

<p>Kompetisi yang diikuti merupakan ajang bergengsi tingkat nasional yang diikuti oleh ratusan peserta dari berbagai sekolah kejuruan di Indonesia. Para siswa menunjukkan kemampuan luar biasa dalam bidang {jurusan_full}.</p>

<p>"Kami sangat bangga dengan pencapaian siswa-siswi kami. Ini adalah hasil dari pembelajaran yang konsisten dan bimbingan yang tepat dari para guru," ujar Kepala Jurusan {jurusan}.</p>

<p>Prestasi ini sekaligus membuktikan bahwa kualitas pendidikan di SMK Kristen 5 Klaten, khususnya jurusan {jurusan}, mampu bersaing di tingkat nasional.</p>`,
        topik: 'Prestasi'
      },
      {
        titleTemplate: 'Workshop Terkini di Jurusan {jurusan}: Mempersiapkan Siswa untuk Industri',
        content: `<p>Jurusan {jurusan_full} SMK Kristen 5 Klaten menyelenggarakan workshop intensif untuk mempersiapkan siswa menghadapi tantangan dunia industri. Workshop ini menghadirkan praktisi profesional dari berbagai perusahaan terkemuka.</p>

<p>Kegiatan workshop berlangsung selama 3 hari dan diikuti oleh seluruh siswa kelas XI dan XII. Materi yang disampaikan mencakup teknologi terkini, best practices industri, dan soft skills yang dibutuhkan di dunia kerja.</p>

<p>Para siswa terlihat antusias mengikuti setiap sesi workshop. Mereka mendapat kesempatan langsung untuk praktik menggunakan peralatan dan teknologi yang sama dengan yang digunakan di industri.</p>

<p>"Workshop seperti ini sangat bermanfaat untuk menjembatani gap antara pendidikan di sekolah dengan kebutuhan industri," kata salah satu narasumber dari industri.</p>`,
        topik: 'Kegiatan'
      },
      {
        titleTemplate: 'Inovasi Terbaru dalam Pembelajaran {jurusan} di Era Digital',
        content: `<p>Jurusan {jurusan_full} SMK Kristen 5 Klaten terus berinovasi dalam metode pembelajaran untuk mengikuti perkembangan teknologi di era digital. Berbagai perangkat dan metode pembelajaran modern telah diimplementasikan.</p>

<p>Salah satu inovasi yang diterapkan adalah penggunaan platform pembelajaran digital yang memungkinkan siswa mengakses materi kapan saja dan di mana saja. Selain itu, laboratorium jurusan juga telah dilengkapi dengan peralatan terkini.</p>

<p>Guru-guru {jurusan} juga rutin mengikuti pelatihan dan workshop untuk meningkatkan kompetensi dalam penggunaan teknologi pembelajaran. Hal ini bertujuan agar mereka dapat memberikan pembelajaran yang relevan dan up-to-date.</p>

<p>Dengan berbagai inovasi ini, diharapkan siswa {jurusan} dapat lebih siap menghadapi tantangan di dunia kerja yang terus berkembang pesat.</p>`,
        topik: 'Teknologi'
      }
    ];

    // Delete existing dummy articles (optional - to prevent duplicates on re-run)
    console.log('\n🗑️  Cleaning up old dummy articles...');
    await Article.deleteMany({
      title: {
        $regex: /(Prestasi Gemilang|Workshop Terkini|Inovasi Terbaru)/i
      }
    });

    // Create 3 articles for each jurusan
    console.log('\n📰 Creating articles...');
    let totalCreated = 0;

    for (const jurusan of jurusans) {
      console.log(`\n   Creating articles for ${jurusan.code} (${jurusan.name})...`);

      // Find the jurusan category
      const jurusanCategory = createdJurusanCategories.find(
        cat => cat.name === jurusan.code
      );

      for (const template of articleTemplates) {
        // Find the topik category
        const topikCategory = createdTopikCategories.find(
          cat => cat.name === template.topik
        );

        // Replace placeholders in title and content
        const title = template.titleTemplate
          .replace(/{jurusan}/g, jurusan.code)
          .replace(/{jurusan_full}/g, jurusan.name);

        const content = template.content
          .replace(/{jurusan}/g, jurusan.code)
          .replace(/{jurusan_full}/g, jurusan.name);

        // Create article
        const article = await Article.create({
          title,
          content,
          categoryJurusan: jurusanCategory._id,
          categoryTopik: topikCategory._id,
          status: 'published',
          author: adminUser._id,
          approvedBy: adminUser._id,
          approvedAt: new Date(),
          publishedAt: new Date(),
          tags: [jurusan.code, template.topik, 'SMK Kristen 5'],
          views: Math.floor(Math.random() * 500) // Random views between 0-500
        });

        console.log(`      ✅ Created: ${article.title.substring(0, 50)}...`);
        totalCreated++;
      }
    }

    console.log(`\n✨ Successfully created ${totalCreated} articles!`);
    console.log(`   ${jurusans.length} jurusan × 3 articles each = ${totalCreated} total articles\n`);

  } catch (error) {
    console.error('❌ Error seeding articles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the seed function
seedArticles();
