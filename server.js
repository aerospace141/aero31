// require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require('mongoose');

const signup = require('./Routes/user_auth/signup');
const login = require('./Routes/user_auth/login');
const otp = require('./Routes/user_auth/otp');
const profile = require('./Routes/user_auth/profile');

const c_detail = require('./Routes/customer/C_detail')
const customer = require('./Routes/customer/customer');
const transactions = require('./Routes/customer/transaction');
const chat = require('./Routes/customer/chat');

const s_detail = require('./Routes/supplier/S_detail');
const supplier = require('./Routes/supplier/supplier');
const suppconnect = require('./Routes/supplier/supp-connect');

const seebycustomer = require('./Routes/look_by_customer/see_by_customer')
const connect = require('./Routes/look_by_customer/connect');

const loanRoutes = require('./Routes/Loans/loanRoutes');
const loanProfile = require('./Routes/Loans/loan-profile');
const evolve = require('./Routes/Loans/evolve');
const add = require('./Routes/Loans/add');
const imageRoutes = require("./Routes/dbs/imageRoutes");
const sigRoute = require('./Routes/Loans/signature/sigRoute');
const imgRoute = require('./Routes/customer/imageRoute');
const docs = require('./Routes/customer/uploads');


app.use(bodyParser.json());

app.use(cors({ origin: 'https://ledger1x.web.app' }));

app.use('/api', signup);
app.use('/api', login);  
app.use('/api', otp);
app.use('/api', profile);

app.use('/api', c_detail);
app.use('/api', customer);
app.use('/api', transactions);
app.use('/api', chat);

app.use('/api', s_detail);
app.use('/api', supplier);
app.use('/api', suppconnect);

app.use('/api', seebycustomer);
app.use('/api', connect);

app.use('/api', add);
app.use('/api', loanRoutes);
app.use('/api', loanProfile);
app.use('/api', evolve);

app.use("/api/images", imageRoutes);
app.use("/api", sigRoute );
app.use("/api", imgRoute );
app.use("/api", docs );

// Middleware

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://ayush1777:agr11@cluster0.0128p.mongodb.net/FOILAR";

mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB using Mongoose 8.2.1'))
  .catch((err) => console.error('Connection error:', err));
  
  const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/uploads', express.static('uploads'));

app.use(express.json());

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/",(req,res) => {
  res.status(200).send("hi, Its working.");
})

// Start the server ui
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// 00