import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Prestasi from '../models/Prestasi.js';
import Jurusan from '../models/Jurusan.js';

dotenv.config();

const updatePrestasiJurusan = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Get all jurusan
    const jurusans = await Jurusan.find();
    console.log(`\n📚 Found ${jurusans.length} jurusan`);

    // Get all prestasi
    const allPrestasi = await Prestasi.find();
    console.log(`📝 Found ${allPrestasi.length} prestasi`);

    // Update existing prestasi - distribute them among jurusan
    console.log('\n🔄 Updating prestasi with jurusan field...\n');

    let updated = 0;
    for (let i = 0; i < allPrestasi.length; i++) {
      const prestasi = allPrestasi[i];

      // Assign jurusan in a round-robin fashion, with some as PUBLIC (null)
      // 30% will be PUBLIC, rest distributed among jurusan
      if (i % 10 < 3) {
        // 30% PUBLIC (null jurusan)
        prestasi.jurusan = null;
        await prestasi.save();
        console.log(`   ✅ Set "${prestasi.title.substring(0, 50)}..." as PUBLIC`);
      } else {
        // 70% assigned to specific jurusan
        const jurusanIndex = i % jurusans.length;
        const assignedJurusan = jurusans[jurusanIndex];
        prestasi.jurusan = assignedJurusan.code;
        await prestasi.save();
        console.log(`   ✅ Set "${prestasi.title.substring(0, 50)}..." to ${assignedJurusan.code}`);
      }
      updated++;
    }

    console.log(`\n✨ Successfully updated ${updated} prestasi!\n`);

  } catch (error) {
    console.error('❌ Error updating prestasi:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the update function
updatePrestasiJurusan();
