const express = require("express");
const cloudinary = require("../dbs/cloudinaryConfig");
const upload = require("../dbs/multerConfig");
const fs = require("fs");
const Customer = require("./../../models/Customer"); // Import your Customer Model


const router = express.Router();


// Upload Image for a Specific Customer
router.post("/ac/upload/:customerID", upload.single("image"), async (req, res) => {
    try {
      const { customerID } = req.params;
  
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }



       // Find customer and get the old image URL
    const customer1 = await Customer.findOne({ customerID });

    if (customer1 && customer1.profileImage) {
      // Extract public_id from Cloudinary URL
      const oldImagePublicId = customer1.profileImage.split("/").pop().split(".")[0];

      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(`customer_images/${customerID}/${oldImagePublicId}`);
    }


  
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: `CDP1/${customerID}`, // Separate images per customer
      });
  
      // Delete local file after uploading
      fs.unlinkSync(req.file.path);
  
      // Find customer and update profile image URL
      const customer = await Customer.findOneAndUpdate(
        { customerID: customerID },
        { profileImage: result.secure_url },
        { new: true, upsert: true }
      );
  
      res.json({ message: "Image uploaded successfully", imageUrl: result.secure_url, customer });
  
    } catch (error) {
      res.status(500).json({ error: "Image upload failed", details: error.message });
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