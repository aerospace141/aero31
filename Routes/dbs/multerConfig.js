const multer = require("multer");
const path = require("path");

// Storage setup (Temporary)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null); // Temp save before uploading to Cloudinary
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter (only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
