const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  ByPhoneNumber: { type:Number, required:true },
  userId: { type: String, ref: 'User', required: true },
});

module.exports = mongoose.model('Supplier', supplierSchema);
