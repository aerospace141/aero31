const express = require("express");
const cloudinary = require("../dbs/cloudinaryConfig");
const upload = require("../dbs/multerConfig");
const Customer = require("../../models/Customer");
const streamifier = require("streamifier");

const router = express.Router();

// ✅ Upload Profile Image (Now works with memory storage)
router.post("/ac/upload/:customerID", upload.single("image"), async (req, res) => {
    try {
        const { customerID } = req.params;
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // ✅ Remove old profile image from Cloudinary (if exists)
        const customer = await Customer.findOne({ customerID });
        if (customer && customer.profileImage) {
            const oldImagePublicId = customer.profileImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`CDP1/${customerID}/${oldImagePublicId}`);
        }

        // ✅ Upload image to Cloudinary using a stream
        const streamUpload = async (fileBuffer, folderPath) => {
          return new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                  { folder: folderPath },
                  (error, result) => (error ? reject(error) : resolve(result))
              );
              streamifier.createReadStream(fileBuffer).pipe(stream);
          });
      };
      

        const result = await streamUpload(req.file.buffer, `CDP1/${customerID}`);

        // ✅ Update customer profile image in database
        const updatedCustomer = await Customer.findOneAndUpdate(
            { customerID },
            { profileImage: result.secure_url },
            { new: true, upsert: true }
        );

        res.json({ message: "Profile image uploaded successfully", imageUrl: result.secure_url, updatedCustomer });

    } catch (error) {
        res.status(500).json({ error: "Image upload failed", details: error.message });
    }
});

// ✅ Retrieve Profile Image
router.get("/imag/:customerID", async (req, res) => {
    try {
        const customer = await Customer.findOne({ customerID: req.params.customerID });
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json({ profileImage: customer.profileImage });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving customer", details: error.message });
    }
});

module.exports = router;
