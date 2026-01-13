const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// ===== CLOUDINARY CONFIGURATION =====
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration
console.log('🔧 Cloudinary Configuration:');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ MISSING');
console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ MISSING');
console.log('   API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ MISSING');

// ===== MULTER MEMORY STORAGE (temporarily store in memory before uploading to Cloudinary) =====
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, GIF) are allowed!'));
  }
};

// ===== MULTER UPLOAD MIDDLEWARE =====
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// ===== UTILITY FUNCTION TO UPLOAD TO CLOUDINARY =====
async function uploadToCloudinary(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'it-monitoring-dashboard',
        resource_type: 'auto',
        transformation: [{ width: 1500, height: 1500, crop: 'limit' }]
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Image uploaded to Cloudinary:', result.secure_url);
          resolve(result);
        }
      }
    );
    
    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = Readable.from(fileBuffer);
    bufferStream.pipe(uploadStream);
  });
}

// ===== UTILITY FUNCTION TO DELETE IMAGES FROM CLOUDINARY =====
async function deleteImageFromCloudinary(imageUrl) {
  if (!imageUrl) return;
  
  try {
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].[format]
    const urlParts = imageUrl.split('/');
    const fileWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileWithExtension.split('.')[0];
    const folder = 'it-monitoring-dashboard';
    const fullPublicId = `${folder}/${publicId}`;
    
    const result = await cloudinary.uploader.destroy(fullPublicId);
    console.log(`🗑️  Cloudinary delete result for ${fullPublicId}:`, result);
    return result;
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
    return null;
  }
}

module.exports = {
  cloudinary,
  upload,
  uploadToCloudinary,
  deleteImageFromCloudinary
};
