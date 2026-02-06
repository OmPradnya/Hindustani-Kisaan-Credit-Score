const jwt = require('jsonwebtoken');
const Farmer = require('../models/Farmer');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register a new farmer
const register = async (req, res) => {
    try {
        const { username, password, name } = req.body;

        // Validate inputs
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Username must be at least 3 characters'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Check if user already exists
        const existingFarmer = await Farmer.findOne({ username: username.toLowerCase() });
        if (existingFarmer) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists. Please choose another.'
            });
        }

        // Create new farmer
        const farmer = new Farmer({
            username: username.toLowerCase(),
            password,
            name: name || 'Kisaan'
        });

        await farmer.save();

        console.log(`✅ New farmer registered: ${username}`);

        res.status(201).json({
            success: true,
            message: 'Registration successful!',
            token: generateToken(farmer._id),
            user: {
                id: farmer._id,
                username: farmer.username,
                name: farmer.name
            }
        });

    } catch (error) {
        console.error('Registration Error:', error.message);
        console.error('Full error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
};

// Login farmer
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate inputs
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Find farmer
        const farmer = await Farmer.findOne({ username: username.toLowerCase() });
        if (!farmer) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        // Check password
        const isMatch = await farmer.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Invalid username or password'
            });
        }

        console.log(`✅ Farmer logged in: ${username}`);

        res.json({
            success: true,
            message: 'Login successful!',
            token: generateToken(farmer._id),
            user: {
                id: farmer._id,
                username: farmer.username,
                name: farmer.name,
                aadhaarVerified: farmer.aadhaarVerified
            }
        });

    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
};

// Get current farmer profile
const getProfile = async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.user._id).select('-password'); // Exclude password
        if (!farmer) {
            return res.status(404).json({ success: false, message: 'Farmer not found' });
        }
        res.json({ success: true, user: farmer });
    } catch (error) {
        console.error('Profile Error:', error.message);
        res.status(500).json({ success: false, message: 'Error fetching profile' });
    }
};

module.exports = { register, login, getProfile };
