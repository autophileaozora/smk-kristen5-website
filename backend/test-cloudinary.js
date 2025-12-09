import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Load environment variables
dotenv.config();

console.log('=== CLOUDINARY CONFIGURATION CHECK ===\n');

console.log('Environment Variables:');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not Set');
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not Set');
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not Set');

if (process.env.CLOUDINARY_CLOUD_NAME) {
  console.log('\nCloud Name Value:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('Cloud Name Length:', process.env.CLOUDINARY_CLOUD_NAME.length);
}

if (process.env.CLOUDINARY_API_KEY) {
  console.log('\nAPI Key Value:', process.env.CLOUDINARY_API_KEY);
  console.log('API Key Length:', process.env.CLOUDINARY_API_KEY.length);
}

if (process.env.CLOUDINARY_API_SECRET) {
  console.log('\nAPI Secret Length:', process.env.CLOUDINARY_API_SECRET.length);
  console.log('API Secret First 4 chars:', process.env.CLOUDINARY_API_SECRET.substring(0, 4) + '...');
}

// Configure Cloudinary
console.log('\n=== CONFIGURING CLOUDINARY ===\n');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('Cloudinary Config:', cloudinary.config());

// Test upload
console.log('\n=== TESTING CLOUDINARY CONNECTION ===\n');

const testBuffer = Buffer.from('test');

cloudinary.uploader.upload_stream(
  { folder: 'smk-kristen5-test' },
  (error, result) => {
    if (error) {
      console.error('❌ Upload Test FAILED:', error);
    } else {
      console.log('✅ Upload Test SUCCESS!');
      console.log('URL:', result.secure_url);
      
      // Clean up test file
      cloudinary.uploader.destroy(result.public_id, (delError) => {
        if (delError) {
          console.log('Note: Could not delete test file');
        } else {
          console.log('Test file cleaned up');
        }
        process.exit(0);
      });
    }
  }
).end(testBuffer);
