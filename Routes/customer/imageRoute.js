const express = require("express");
const cloudinary = require("../dbs/cloudinaryConfig"); // Ensure correct import
const upload = require("../dbs/multerConfig"); // Multer for image handling
const fs = require("fs");
const Customer = require("../../models/Customer");
const streamifier = require("streamifier");

const router = express.Router();

// ✅ Upload Profile Image for Customer
router.post("/ac/upload/:customerID", upload.single("image"), async (req, res) => {
    try {
        const { customerID } = req.params;
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // Find customer & remove old image from Cloudinary
        const customer = await Customer.findOne({ customerID });
        if (customer && customer.profileImage) {
            const oldImagePublicId = customer.profileImage.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(`CDP1/${customerID}/${oldImagePublicId}`);
        }

        // ✅ Upload image to Cloudinary
        const result = await cloudinary.uploader.upload_stream(
            { folder: `CDP1/${customerID}` },
            async (error, result) => {
                if (error) return res.status(500).json({ error: "Cloudinary upload failed", details: error.message });

                // ✅ Update customer profile image URL in database
                const updatedCustomer = await Customer.findOneAndUpdate(
                    { customerID },
                    { profileImage: result.secure_url },
                    { new: true, upsert: true }
                );

                res.json({ message: "Profile image uploaded successfully", imageUrl: result.secure_url, updatedCustomer });
            }
        );

        streamifier.createReadStream(req.file.buffer).pipe(result);

    } catch (error) {
        res.status(500).json({ error: "Image upload failed", details: error.message });
    }
});

// ✅ Retrieve Customer Image
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
