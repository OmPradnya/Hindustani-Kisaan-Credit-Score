const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
    },
    otp: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    },
    verified: {
        type: Boolean,
        default: false
    },
    attempts: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Auto-delete after 10 minutes (TTL index)
    }
});

// Index for faster lookups
OTPSchema.index({ mobile: 1, otp: 1 });

module.exports = mongoose.model('OTP', OTPSchema);
