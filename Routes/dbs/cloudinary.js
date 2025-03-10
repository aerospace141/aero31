require("dotenv").config(); // ✅ Load environment variables
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Secure Cloudinary Configuration
cloudinary.config({
  cloud_name: "dvopqpu5k",
  api_key: "513979796987495",
  api_secret: "D9_QhGim0a4O2CYhzvF7Ur1Br2I",
});

// ✅ Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "uploads", // Change folder name as needed
    allowed_formats: ["jpg", "png", "jpeg", "gif"],
  },
});

// ✅ Initialize Multer with Cloudinary Storage
const upload = multer({ storage });

module.exports = { upload, cloudinary };
