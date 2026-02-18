import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify Cloudinary configuration
const verifyCloudinaryConfig = async () => {
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing Cloudinary environment variables:', missing.join(', '));
    console.error('Please check your .env file and ensure all Cloudinary credentials are set.');
    return false;
  }
  
  console.log('✅ Cloudinary configuration loaded successfully');
  console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  
  // Test Cloudinary connection
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection verified - API is accessible');
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection test FAILED!');
    console.error('   Error:', error.error?.message || error.message);
    if (error.error?.http_code === 403) {
      console.error('   → Invalid API credentials (API Key or API Secret is incorrect)');
      console.error('   → Please verify your credentials at: https://cloudinary.com/console');
    } else if (error.error?.http_code === 401) {
      console.error('   → Authentication failed. Check your API Key and Secret.');
    }
    return false;
  }
};

// Run verification
verifyCloudinaryConfig();

// Create storage for student submissions
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    if (file.mimetype === 'application/pdf' || 
        file.mimetype.includes('document') || 
        file.mimetype.includes('msword')) {
      resourceType = 'raw'; // Use 'raw' for PDFs and documents
    } else if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    }
    
    return {
      folder: 'progresspoint/student-submissions',
      allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      resource_type: resourceType,
      access_mode: 'public', // Ensure files are publicly accessible
      public_id: `student_${Date.now()}_${Math.random().toString(36).substring(7)}`
    };
  }
});

// Multer upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB default max size
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, PDF, and DOC files are allowed.'));
  }
});

// Function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary;
