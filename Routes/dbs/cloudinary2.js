const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ✅ Cloudinary Configuration
cloudinary.config({
    cloud_name: "dvopqpu5k",
    api_key: "513979796987495",
    api_secret: "D9_QhGim0a4O2CYhzvF7Ur1Br2I",
});

// ✅ Cloudinary Storage for Signatures
const signatureStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "signatures", // Folder in Cloudinary
    format: async (req, file) => "png", // Adjust format if needed
    public_id: (req, file) => `signature-${Date.now()}-${file.originalname}`,
  },
});

// ✅ Export Upload Middleware
const upload2 = multer({ storage: signatureStorage });

module.exports = { upload2, cloudinary };
