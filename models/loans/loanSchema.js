const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  customerID: {
    type: String,
    // ref: 'Customer', 
  },
  addedBy:{
    type: String,
  },
  profileImage: { type: String }, 

  loanDetails: {
    loanType: { type: String, required: true, enum: ['With Interest', 'EMI Collection'] },
    method: { type: String, required: true, enum: ['Cash', 'Bank Transfer', 'Credit Card'] , default: 'Cash'  },
    amount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    
    accruedInterest: { type: Number, default: 0 },
    interestStartDate:{ type: Date, },
    totalAmount: { type: Number, default: 0 },

    interestFrequency: {
      type: String,
      required: true,
      enum: ['Daily', 'Weekly', '15 Days', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
    },
    compoundInterest: {
      enabled: { type: Boolean, required: true },
      frequency: {
        type: String,
        enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
        default: null,
      },
    },
    startDate: { type: Date, required: true },
    attachments: [{ type: String }],
    signature: [
      {
        // path: { type: String, required: true },
        path: { type: String, required: true, validate: /^\/uploads\/.*\.(png|jpg|jpeg)$/ },
        date: { type: Date, required: true }, // Add a date field for each attachment
      },
    ],
    date: [{ type: Date }],
    // loanDuration: { type: String , default: null},
    remarks: { type: String, default: '' },
    billNo: { type:String , default:123},
    paymentHistory: [  
      {  
          amount: { type: Number, required: true },  
          date: { type: Date, required: true },  
          method: { type: String, required: true }, // e.g., 'Credit Card', 'Bank Transfer'  
      },  
  ],

  remainingPrincipal: { type:Number } ,  // ✅ Add this if missing

  
  topUpHistory: [
    {
      amount: { type: Number, required: true },
      date: { type: Date, required: true },
      method: { type: String, required: true },
      topupinterestrate: { type: String, require: true},
    },
  ],
  topUpInterest:{  
    type: Number,  
    },
  topUpTotal: {  
    type: Number, 
    },

    topDownHistory: [
      {
        amount: Number,
        date: Date,
        method: String,
        redeem: Number,
      },
    ], 
    
    totalRepaid: { 
      type: Number,

    },
  
  loanDuration: {  
    type: Number, // Duration in months or years  
    },
    
interestMethod: {  
  type: String,  
  enum: ['Simple', 'Compound'],  
  required: true,  
  default: 'Simple', // Default to simple interest  
},    
gracePeriod: {  
  type: Number, // Number of months  
  default: 0,  
},


  },
  status: {  
    type: String,  
    enum: ['active', 'closed', 'defaulted'],  
    default: 'active',  
  },  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Loan', loanSchema);
