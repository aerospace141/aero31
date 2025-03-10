const multer = require("multer");
const path = require("path");

// ✅ Configure Storage for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Ensure this folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// ✅ Multer Upload Middleware
const upload = multer({ storage });

module.exports = upload;
