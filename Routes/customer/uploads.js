const express = require("express");
const cloudinary = require("../dbs/cloudinaryConfig");
const upload = require("../dbs/multerConfig");
const fs = require("fs");
const Customer = require("../../models/Customer");

const router = express.Router();

// Upload Images & Documents
router.post("/doc/upload/:customerID", upload.fields([{ name: "images" }, { name: "documents" }]), async (req, res) => {
  try {
    const { customerID } = req.params;
    const customer = await Customer.findOne({ customerID });

    let imageUrls = customer?.images || [];
    let documentUrls = customer?.documents || [];

    // Upload new images to Cloudinary ---that was working perfect ly the only reson the comment ot this is timstamp
    // if (req.files.images) {
    //   for (const file of req.files.images) {
    //     const imageUpload = await cloudinary.uploader.upload(file.path, { folder: `customers/${customerID}/images` });
    //     imageUrls.push(imageUpload.secure_url);
    //     fs.unlinkSync(file.path);
    //   }
    // }

    let newImages = [];
    let newDocuments = [];

    // Upload new images to Cloudinary
    if (req.files.images) {
      for (const file of req.files.images) {
        const imageUpload = await cloudinary.uploader.upload(file.path, { folder: `customers/${customerID}/images` });
        newImages.push({ 
          image: imageUpload.secure_url, 
          timestamp: new Date(), 
          senderYou: "You"  // Replace with actual sender info if needed
        });
        fs.unlinkSync(file.path);
      }
    }

     // Upload new documents to Cloudinary
     if (req.files.documents) {
      for (const file of req.files.documents) {
        const docUpload = await cloudinary.uploader.upload(file.path, {
          folder: `customers/${customerID}/documents`,
          resource_type: "raw",
        });
        newDocuments.push({ 
          url: docUpload.secure_url, 
          timestamp: new Date() 
        });
        fs.unlinkSync(file.path);
      }
    }

    // Upload new documents to Cloudinary
    // if (req.files.documents) {
    //   for (const file of req.files.documents) {
    //     const docUpload = await cloudinary.uploader.upload(file.path, {
    //       folder: `customers/${customerID}/documents`,
    //       resource_type: "raw",
    //     });
    //     documentUrls.push(docUpload.secure_url);
    //     fs.unlinkSync(file.path);
    //   }
    // }

    // Update customer record
    // const updatedCustomer = await Customer.find(
    //   { customerID },
    //   { images: imageUrls, 
    //     documents: documentUrls },
    //   { new: true, upsert: true }
    // );

    // const updatedCustomer = await Customer.findOneAndUpdate(
    //   { customerID },
    //   { 
    //     $push: { 
    //       images: { $each: imageUrls }, 
    //       documents: { $each: documentUrls } 
    //     }
    //   },
    //   { new: true }
    // );

    const updatedCustomer = await Customer.findOneAndUpdate(
      { customerID },
      { 
        $push: { 
          images: newImages, 
          documents: newDocuments 
        }
      },
      { new: true }
    );
    

    res.json({ message: "Files uploaded successfully", images: imageUrls, documents: documentUrls });
  } catch (error) {
    res.status(500).json({ error: "File upload failed", details: error.message });
  }
});

// Retrieve Files
router.get("/files/:customerID", async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerID: req.params.customerID });
    
    if (!customer) {
      console.log("❌ Customer not found!");
      return res.status(404).json({ error: "Customer not found" });
    }

    console.log("✅ Fetched Customer Data:", customer);
    res.json({ images: customer.images, documents: customer.documents });
  } catch (error) {
    console.error("❌ Error fetching files:", error);
    res.status(500).json({ error: "Error retrieving files", details: error.message });
  }
});


module.exports = router;
