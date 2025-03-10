const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: "dvopqpu5k",
    api_key: "513979796987495",
    api_secret: "D9_QhGim0a4O2CYhzvF7Ur1Br2I",
});

// ✅ Define Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Change folder name as needed
    format: async (req, file) => "png", // Adjust format if needed
    public_id: (req, file) => `image-${Date.now()}-${file.originalname}`,
  },
});

// ✅ Create Multer Upload Middleware
const upload = multer({ storage });

module.exports = { upload, cloudinary };
