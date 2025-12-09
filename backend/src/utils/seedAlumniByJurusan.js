import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Alumni from '../models/Alumni.js';
import Jurusan from '../models/Jurusan.js';
import User from '../models/User.js';

dotenv.config();

const seedAlumniByJurusan = async () => {
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

    // Alumni templates with name variations
    const alumniTemplates = [
      {
        names: ['Budi Santoso', 'Siti Nurhaliza', 'Ahmad Fauzi', 'Rina Wati', 'Dedi Kurniawan', 'Maya Sari'],
        occupations: {
          AKL: ['Accounting Staff', 'Finance Analyst', 'Tax Consultant'],
          BD: ['Business Development Executive', 'Sales Manager', 'Marketing Specialist'],
          DKV: ['Graphic Designer', 'UI/UX Designer', 'Creative Director'],
          OTKP: ['Office Manager', 'Administrative Officer', 'Executive Secretary'],
          RPL: ['Software Developer', 'Full Stack Developer', 'Mobile App Developer'],
          TKJ: ['Network Engineer', 'IT Support Specialist', 'System Administrator']
        },
        companies: ['PT Maju Jaya', 'CV Berkah Sejahtera', 'Startup Digital Indonesia', 'Bank Mandiri', 'Telkom Indonesia', 'Gojek', 'Tokopedia', 'Bukalapak'],
        universities: ['Universitas Gadjah Mada', 'Institut Teknologi Bandung', 'Universitas Indonesia', 'Universitas Brawijaya', 'Tidak melanjutkan', 'Universitas Sebelas Maret'],
        achievements: {
          AKL: ['Lulus sertifikasi Brevet Pajak', 'Juara 3 Lomba Akuntansi tingkat provinsi', 'Best Employee of the Year 2024'],
          BD: ['Top Sales Achievement 2024', 'Sukses mengelola project senilai 500 juta', 'Sertifikasi Digital Marketing Expert'],
          DKV: ['Juara 1 Lomba Desain Poster Nasional', 'Karya ditampilkan di Indonesia Design Week', 'Sertifikasi Adobe Certified Professional'],
          OTKP: ['Sertifikasi Microsoft Office Specialist', 'Best Administrative Staff 2024', 'Mengelola event nasional dengan 500+ peserta'],
          RPL: ['Juara Hackathon Nasional 2024', 'Developer aplikasi dengan 10K+ download', 'Kontributor Open Source Project'],
          TKJ: ['Sertifikasi CCNA Cisco', 'Mengelola jaringan untuk 100+ devices', 'IT Security Specialist Certified']
        },
        testimonials: {
          AKL: [
            'Pembelajaran akuntansi yang mendalam membuat saya siap kerja di industri keuangan.',
            'Guru-guru sangat kompeten dalam mengajar praktik pembukuan dan perpajakan.',
            'Magang di perusahaan besar memberi pengalaman berharga untuk karir saya.'
          ],
          BD: [
            'Program bisnis dan pemasaran sangat relevan dengan dunia kerja saat ini.',
            'Saya belajar strategi penjualan yang langsung bisa diterapkan di lapangan.',
            'Keterampilan komunikasi dan negosiasi yang diajarkan sangat membantu karir saya.'
          ],
          DKV: [
            'Fasilitas lab desain yang lengkap membantu saya mengembangkan kreativitas.',
            'Portfolio yang dibangun selama sekolah menjadi modal utama melamar kerja.',
            'Belajar dari praktisi industri membuat saya paham kebutuhan pasar desain.'
          ],
          OTKP: [
            'Keterampilan administrasi perkantoran yang diajarkan sangat aplikatif.',
            'Saya belajar mengelola dokumen dan event dengan profesional.',
            'Praktik langsung menggunakan software perkantoran sangat bermanfaat.'
          ],
          RPL: [
            'Kurikulum pemrograman yang up-to-date dengan teknologi terkini.',
            'Project-based learning membuat saya terbiasa kerja dalam tim developer.',
            'Guru sangat supportif dalam membimbing pembuatan aplikasi dari nol.'
          ],
          TKJ: [
            'Praktikum jaringan dengan peralatan profesional sangat membantu.',
            'Saya mendapat sertifikasi industri yang meningkatkan peluang kerja.',
            'Pemahaman troubleshooting yang diajarkan sangat berguna di dunia kerja.'
          ]
        }
      }
    ];

    const template = alumniTemplates[0];
    const currentYear = new Date().getFullYear();
    const years = [2023, 2024, 2025];

    // Delete existing seeded alumni to prevent duplicates
    console.log('\n🗑️  Cleaning up old seeded alumni...');
    await Alumni.deleteMany({
      name: { $in: template.names }
    });

    console.log('\n👨‍🎓 Creating alumni for each jurusan...\n');
    let totalCreated = 0;

    for (const jurusan of jurusans) {
      console.log(`\n   Creating 3 alumni for ${jurusan.code} (${jurusan.name})...`);

      for (let i = 0; i < 3; i++) {
        const randomNameIndex = Math.floor(Math.random() * template.names.length);
        const name = template.names[randomNameIndex];

        const occupations = template.occupations[jurusan.code] || ['Professional', 'Specialist', 'Expert'];
        const occupation = occupations[i % occupations.length];

        const companyIndex = Math.floor(Math.random() * template.companies.length);
        const company = template.companies[companyIndex];

        const universityIndex = Math.floor(Math.random() * template.universities.length);
        const university = template.universities[universityIndex];

        const achievements = template.achievements[jurusan.code] || ['Prestasi Gemilang'];
        const achievement = achievements[i % achievements.length];

        const testimonials = template.testimonials[jurusan.code] || ['Sekolah yang luar biasa!'];
        const testimonial = testimonials[i % testimonials.length];

        const graduationYear = years[i % years.length];

        // Create unique name with jurusan code to avoid slug collision
        const uniqueName = `${name} ${jurusan.code} ${graduationYear}`;

        const alumni = await Alumni.create({
          name: uniqueName,
          graduationYear: graduationYear,
          jurusan: jurusan.code,
          currentOccupation: occupation,
          company: company,
          university: university,
          achievement: achievement,
          testimonial: testimonial,
          linkedIn: `https://linkedin.com/in/${name.toLowerCase().replace(/ /g, '')}-${jurusan.code.toLowerCase()}-${graduationYear}`,
          isPublished: true,
          isFeatured: i === 0, // First alumni is featured
          createdBy: adminUser._id
        });

        console.log(`      ✅ Created: ${alumni.name} (${alumni.graduationYear}) - ${alumni.currentOccupation}`);
        totalCreated++;
      }
    }

    console.log(`\n✨ Successfully created ${totalCreated} alumni!`);
    console.log(`   ${jurusans.length} jurusan × 3 alumni each = ${totalCreated} total alumni\n`);

  } catch (error) {
    console.error('❌ Error seeding alumni:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the seed function
seedAlumniByJurusan();
