const multer = require("multer");

// ✅ Use Memory Storage (No Local Uploads)
const storage = multer.memoryStorage(); 

// ✅ File filter for allowed formats
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image and document files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
