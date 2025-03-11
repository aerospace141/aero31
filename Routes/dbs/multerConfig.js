const multer = require("multer");

// ✅ Memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed!"), false);
    }
};

// ✅ Export multer upload instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
