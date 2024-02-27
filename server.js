const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;


app.use(cors());
// // MongoDB Connection URL
const mongoURI = 'mongodb+srv://kajalbaisakh7:xtgGJho4DkroQFnN@cluster0.ottbswx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(mongoURI,{ useUnifiedTopology: true ,useNewUrlParser: true,});

// // Connect to MongoDB
client.connect(function(err) {
    if (err) {
      console.error('Error connecting to MongoDB:', err);
      return;
    }
    console.log('Connected to MongoDB');})

// Express Middleware
app.use(express.json());

// Generate random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kajalbaisakh7@gmail.com',
        pass: 'hfmz jgnz suju asqu'
    }
});

// Endpoint for user registration
app.post('/register', async (req, res) => {
    try {
        const { email,fullName } = req.body;
        console.log("data",req.body,email,fullName)
        // // Generate OTP
        const otp = generateOTP();
        
        // // Save email and OTP to MongoDB
        const db = client.db('user');
        const collection = db.collection('users');
        await collection.insertOne({ email, otp });
        
        // // Send verification email
        await transporter.sendMail({
            from: email,
            to: email,
            subject: 'Email Verification OTP',
            text: `Your OTP for email verification is: ${otp}`
        });
        
        res.status(200).send('Verification email sent successfully');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint for OTP verification
app.post('/verify-otp', async (req, res) => {
    try {
        const {otp } = req.body;
        console.log("data",req.body,otp)
        // Check OTP against MongoDB
        const db = client.db('user');
        const collection = db.collection('users');
        const user = await collection.findOne({  otp: parseInt(otp) });
        
        if (user) {
            res.status(200).send('OTP verified successfully. Redirect to spin wheel game.');
        } else {
            res.status(400).send('Invalid OTP');
        }
    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/generate-cashback-offer', (req, res) => {
    // Generate a random number between 0 and 1
    const randomNumber = Math.random();
    
    // Generate a random cashback offer based on the random number
    let cashbackOffer;
    if (randomNumber < 0.5) {
        // 50% chance of generating a fixed amount offer
        const fixedAmount = Math.floor(Math.random() * 100); // Generate a random fixed amount between 0 and 100
        cashbackOffer = {
            type: 'fixed_amount',
            value: fixedAmount // You can format this value as needed
        };
    } else {
        // 50% chance of generating a percentage offer
        const percentage = Math.floor(Math.random() * 100); // Generate a random percentage between 0 and 100
        cashbackOffer = {
            type: 'percentage',
            value: percentage // You can format this value as needed
        };
    }

    // Send the cashback offer as JSON response
    res.json(cashbackOffer);
});
// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
