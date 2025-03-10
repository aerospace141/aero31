const express = require("express");
const { cloudinary, upload } = require("../../dbs/cloudinary"); // ✅ Correct Import
const fs = require("fs");
const Loan = require("../../../models/loans/loanSchema");

const router = express.Router();

// ✅ Upload Signature Image to Cloudinary
router.post("/signature/upload/:customerID", upload.single("image"), async (req, res) => {
    try {
        const { customerID } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: "No signature image uploaded" });
        }

        console.log("Received file:", req.file); // Debugging line

        // ✅ Upload to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: `customer_signatures/${customerID}`
        });

        // ✅ Delete local file after upload
        fs.unlinkSync(req.file.path);

        // ✅ Update loan record
        const updatedLoan = await Loan.findOneAndUpdate(
            { customerID: customerID },
            { 
                $set: { "loanDetails.signature": [{ path: result.secure_url, date: new Date() }] } 
            },
            { new: true, upsert: true }
        );

        res.json({ message: "Signature uploaded successfully", signatureUrl: result.secure_url, updatedLoan });

    } catch (error) {
        console.error("Signature upload failed:", error);
        res.status(500).json({ error: "Signature upload failed", details: error.message });
    }
});

// ✅ Get Signature Image
router.get("/signature/image/:customerID", async (req, res) => {
    try {
        const loan = await Loan.findOne({ customerID: req.params.customerID });

        if (!loan || !loan.loanDetails.signature.length) {
            return res.status(404).json({ error: "Signature not found" });
        }

        res.json({ signature: loan.loanDetails.signature });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving signature", details: error.message });
    }
});

module.exports = router;
