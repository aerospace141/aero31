const express = require("express");
const cloudinary = require("../../dbs/cloudinaryConfig");
const upload = require("../../dbs/multerConfig"); // Ensure correct import
const fs = require("fs");
const Customer = require("../../models/Customer");
const streamifier = require("streamifier");

const router = express.Router();

// ✅ Upload Multiple Images & Documents
router.post("/doc/upload/:customerID", upload.fields([{ name: "images" }, { name: "documents" }]), async (req, res) => {
    try {
        const { customerID } = req.params;
        const customer = await Customer.findOne({ customerID });

        let newImages = [];
        let newDocuments = [];

        // ✅ Upload Images to Cloudinary
        if (req.files.images) {
            for (const file of req.files.images) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: `customers/${customerID}/images` },
                        (error, result) => (error ? reject(error) : resolve(result))
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });

                newImages.push({ image: result.secure_url, timestamp: new Date(), senderYou: "You" });
            }
        }

        // ✅ Upload Documents to Cloudinary
        if (req.files.documents) {
            for (const file of req.files.documents) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: `customers/${customerID}/documents`, resource_type: "raw" },
                        (error, result) => (error ? reject(error) : resolve(result))
                    );
                    streamifier.createReadStream(file.buffer).pipe(stream);
                });

                newDocuments.push({ url: result.secure_url, timestamp: new Date() });
            }
        }

        // ✅ Update Customer Record
        const updatedCustomer = await Customer.findOneAndUpdate(
            { customerID },
            { $push: { images: newImages, documents: newDocuments } },
            { new: true }
        );

        res.json({ message: "Files uploaded successfully", images: newImages, documents: newDocuments });

    } catch (error) {
        res.status(500).json({ error: "File upload failed", details: error.message });
    }
});

// ✅ Retrieve Customer Files
router.get("/files/:customerID", async (req, res) => {
    try {
        const customer = await Customer.findOne({ customerID: req.params.customerID });
        if (!customer) return res.status(404).json({ error: "Customer not found" });
        res.json({ images: customer.images, documents: customer.documents });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving files", details: error.message });
    }
});

module.exports = router;
