const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const { calculateAndSaveScore, calculateLoan, getScore } = require('./controllers/scoreController');
const { protect } = require('./middleware/authMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// HKCS & Loan Routes
app.post('/api/score/calculate', protect, calculateAndSaveScore);
app.post('/api/loan/calculate', protect, calculateLoan);
app.get('/api/score/:userId', protect, getScore);

// Health check
app.get('/', (req, res) => {
    res.send("Kisaan Vikas API Running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (v2 - with Profile)`);
});
