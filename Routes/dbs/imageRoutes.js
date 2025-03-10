const express = require("express");
const cloudinary = require("./cloudinaryConfig");
const { upload } = require("./cloudinary");
const fs = require("fs");
const Customer = require("./../../models/loans/loanSchema"); // Import your Customer Model


const router = express.Router();


// Upload Image for a Specific Customer
router.post("/upload/:customerID", upload.single("image"), async (req, res) => {
  try {
    const { customerID } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" }); // 🛑 Return to prevent further execution
    }

    // Find customer and get the old image URL
    const customer1 = await Customer.findOne({ customerID });

    if (customer1 && customer1.profileImage) {
      const oldImagePublicId = customer1.profileImage.split("/").pop().split(".")[0];

      await cloudinary.uploader.destroy(`customer_images/${customerID}/${oldImagePublicId}`);
    }

    // Upload new image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `customer_images/${customerID}`,
    });

    // Find customer and update profile image URL
    const customer = await Customer.findOneAndUpdate(
      { customerID },
      { profileImage: result.secure_url },
      { new: true, upsert: true }
    );

    // ✅ Ensure only one response is sent
    return res.json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      customer,
    });

  } catch (error) {
    console.error("Upload Error:", error); // Debugging
    if (!res.headersSent) { // ✅ Prevent duplicate response
      return res.status(504).json({ error: "Image upload failed", details: error.message });
    }
  }
});

  router.get("/imag/:customerID", async (req, res) => {
    try {
      const customer = await Customer.findOne({ customerID: req.params.customerID });
  
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
  
      res.json({ profileImage: customer.profileImage }); // Only return image URL
    } catch (error) {
      res.status(500).json({ error: "Error retrieving customer", details: error.message });
    }
  });
  
  module.exports = router;