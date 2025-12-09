import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from '../models/Article.js';
import Category from '../models/Category.js';
import Jurusan from '../models/Jurusan.js';

dotenv.config();

const migrateArticleJurusan = async () => {
  try {
    console.log('🔄 Starting migration: Article categoryJurusan from Category to Jurusan...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all categories with type 'jurusan'
    const jurusanCategories = await Category.find({ type: 'jurusan' });
    console.log(`📊 Found ${jurusanCategories.length} jurusan categories in Category collection`);

    // Get all jurusan from Jurusan collection
    const jurusans = await Jurusan.find();
    console.log(`📊 Found ${jurusans.length} jurusan in Jurusan collection`);

    // Create mapping: category name -> jurusan _id
    const categoryToJurusanMap = {};

    for (const category of jurusanCategories) {
      // Find matching jurusan by code (category.name is the code like "TKJ", "RPL", etc)
      const matchingJurusan = jurusans.find(j => j.code === category.name);

      if (matchingJurusan) {
        categoryToJurusanMap[category._id.toString()] = matchingJurusan._id;
        console.log(`✅ Mapped Category "${category.name}" -> Jurusan "${matchingJurusan.code} - ${matchingJurusan.name}"`);
      } else {
        console.log(`⚠️  No matching Jurusan found for Category "${category.name}"`);
      }
    }

    // Get all articles with categoryJurusan
    const articles = await Article.find({ categoryJurusan: { $ne: null } });
    console.log(`\n📊 Found ${articles.length} articles with categoryJurusan`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const article of articles) {
      const oldCategoryId = article.categoryJurusan.toString();
      const newJurusanId = categoryToJurusanMap[oldCategoryId];

      if (newJurusanId) {
        article.categoryJurusan = newJurusanId;
        await article.save();
        updatedCount++;
        console.log(`✅ Updated article "${article.title}" - categoryJurusan: ${oldCategoryId} -> ${newJurusanId}`);
      } else {
        skippedCount++;
        console.log(`⚠️  Skipped article "${article.title}" - no mapping found for categoryJurusan: ${oldCategoryId}`);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`✅ Updated: ${updatedCount} articles`);
    console.log(`⚠️  Skipped: ${skippedCount} articles`);
    console.log('\n✅ Migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateArticleJurusan();
