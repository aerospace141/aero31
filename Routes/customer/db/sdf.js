const express = require("express");
const cloudinary = require("../../dbs/cloudinaryConfig"); // ✅ Ensure correct path
const upload = require("../../dbs/multerConfig"); // ✅ Correct multer import
const streamifier = require("streamifier"); // ✅ Needed for buffer uploads

const router = express.Router();

router.post("/signature/upload/:customerID", upload.single("image"), async (req, res) => {
    try {
        const { customerID } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: "No signature image uploaded" });
        }

        console.log("Received file:", req.file); // Debugging line

        // ✅ Cloudinary upload using buffer
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `customer_signatures/${customerID}` },
          (error, result) => {
            if (error) {
              console.error("Cloudinary upload failed:", error);
              return res.status(500).json({ error: "Cloudinary upload failed", details: error.message });
            }

            res.json({ message: "Signature uploaded successfully", signatureUrl: result.secure_url });
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(uploadStream); // ✅ Upload buffer correctly

    } catch (error) {
        console.error("Signature upload failed:", error);
        res.status(500).json({ error: "Signature upload failed", details: error.message });
    }
});

module.exports = router;
