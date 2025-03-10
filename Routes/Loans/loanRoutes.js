const express = require('express');
const multer = require('multer');
const { upload } = require("./cloudinary");
const { upload2 } = require("../dbs/cloudinary2"); // Cloudinary Upload
const Loan = require('../../models/loans/loanSchema');
const Customer = require('../../models/loans/customer-land');
const { authenticateUser } = require('../../middleware/authentication');

const router = express.Router();

// ✅ Use Cloudinary for File Uploads Instead of Disk Storage
router.post("/add-loan/:customerID", authenticateUser, upload.single("attachments"), async (req, res) => {
  const { customerID } = req.params;
  const { loanType, method, amount, interestRate, interestFrequency, compoundInterest, compoundFrequency, startDate, remarks } = req.body;

  try {
    // ✅ Ensure Customer Exists
    const customer = await Customer.findOne({ customerID });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // ✅ Check if Loan Already Exists
    const existingLoan = await Loan.findOne({ customerID });
    if (existingLoan) {
      return res.status(400).json({ message: "Loan already exists for this customer ID." });
    }

    // ✅ Validate Required Fields
    if (!loanType || !amount || !interestRate || !interestFrequency || !startDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Cloudinary Upload File Check
    const uploadedFile = req.file ? req.file.path : null;

    // ✅ Create Loan Entry
    const loan = await Loan.create({
      customerID,
      addedBy: req.userId,
      loanDetails: {
        loanType,
        method,
        amount,
        interestRate,
        interestStartDate: new Date(),
        interestFrequency,
        compoundInterest: {
          enabled: compoundInterest === "true",
          frequency: compoundInterest ? compoundFrequency : null,
        },
        startDate,
        attachments: uploadedFile ? [uploadedFile] : [],
        remarks,
      },
    });

    res.status(201).json({ message: "Loan added successfully", loan });
  } catch (error) {
    console.error("Error adding loan:", error);
    res.status(500).json({ message: "Error adding loan", error: error.message });
  }
});

// ✅ Get Loan Profile
router.get('/loan-profile/:customerID', authenticateUser, async (req, res) => {
  try {
    const loan = await Loan.findOne({ customerID: req.params.customerID, addedBy: req.userId });
    if (!loan) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this loan' });
    }
    res.json(loan);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// ✅ Upload Signature to Cloudinary
router.post('/loan-profile/:customerID/signature', authenticateUser, upload2.single('attachments'), async (req, res) => {
  try {
    const { customerID } = req.params;
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const attachmentEntry = { path: filePath, date: new Date() };

    const loan = await Loan.findOneAndUpdate(
      { customerID, addedBy: req.userId },
      { $push: { "loanDetails.signature": attachmentEntry } },
      { new: true }
    );

    if (!loan) return res.status(404).send({ message: 'Loan not found.' });

    res.status(200).send(loan);
  } catch (error) {
    console.error('Error saving signature:', error);
    res.status(500).send({ message: 'Error saving signature.' });
  }
});

// ✅ Update Bill Number
router.put('/billNo/:customerID', authenticateUser, async (req, res) => {
  try {
    const { customerID } = req.params;
    const { billNumber } = req.body;

    const loan = await Loan.findOneAndUpdate(
      { customerID, addedBy: req.userId },
      { $set: { "loanDetails.billNo": billNumber } },
      { new: true }
    );

    if (!loan) return res.status(404).send({ message: 'Loan not found.' });

    res.status(200).send(loan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).send({ message: 'Error updating loan.' });
  }
});

// ✅ Calculate Total Amounts
router.get('/total-amount', authenticateUser, async (req, res) => {
  try {
    const peopleOweTotal = await Loan.aggregate([
      { $match: { addedBy: req.userId } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$loanDetails.totalAmount' },
          accruedInterest: { $sum: '$loanDetails.accruedInterest' },
          topUpInterest: { $sum: '$loanDetails.topUpInterest' },
          topUpTotal: { $sum: '$loanDetails.topUpTotal' },
        },
      },
      {
        $project: {
          _id: 0,
          totalLoanWithInterest: { $add: ['$totalAmount', '$accruedInterest', '$topUpInterest', '$topUpTotal'] },
          totalAmount: 1,
          accruedInterest: 1,
          topUpInterest: 1,
          topUpTotal: 1,
        },
      },
    ]);

    res.json({
      totalAmount: peopleOweTotal[0]?.totalAmount || 0,
      accruedInterest: peopleOweTotal[0]?.accruedInterest || 0,
      topUpInterest: peopleOweTotal[0]?.topUpInterest || 0,
      topUpTotal: peopleOweTotal[0]?.topUpTotal || 0,
      totalLoanWithInterest: peopleOweTotal[0]?.totalLoanWithInterest || 0,
      userId: req.userId,
    });
  } catch (error) {
    console.error('Error calculating totals:', error);
    res.status(500).json({ message: 'Error calculating totals', error });
  }
});

// ✅ Fetch Customer Remark
router.get("/:customerID/remark", authenticateUser, async (req, res) => {
  try {
    const customer = await Loan.findOne({ customerID: req.params.customerID });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ remark: customer.loanDetails.remarks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching remark", error });
  }
});

// ✅ Update Customer Remark
router.put("/:customerID/remark", authenticateUser, async (req, res) => {
  try {
    const { remarks } = req.body;
    const customer = await Loan.findOneAndUpdate(
      { customerID: req.params.customerID },
      { $set: { "loanDetails.remarks": remarks } },
      { new: true, upsert: true }
    );
    res.json({ message: "Remark updated successfully", customer });
  } catch (error) {
    res.status(500).json({ message: "Error updating remark", error });
  }
});

module.exports = router;
