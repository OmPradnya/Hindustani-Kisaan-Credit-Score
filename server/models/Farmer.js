const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const FarmerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    // --- Personal Information ---
    personalDetails: {
        name: { type: String, default: 'Kisaan' },
        aadharNumber: { type: String }, // In real app, hash this
        phoneNumber: { type: String },
        district: { type: String },
        state: { type: String },
        age: { type: Number }
    },

    // --- Farming Details ---
    farmingDetails: {
        totalLand: { type: Number, default: 0 }, // Total land owned + leased
        cultivatedLand: { type: Number, default: 0 }, // Actually farmed
        landOwned: { type: Number, default: 0 },
        isTenant: { type: Boolean, default: false },
        hasLeaseAgreement: { type: Boolean, default: false },
        farmingExperienceYears: { type: Number, default: 0 },
        crops: [{
            name: { type: String },
            area: { type: Number },
            yieldPerAcre: { type: Number }, // in quintals
            marketValuationPerQuintal: { type: Number }
        }],
        rainfall: { type: Number }, // Annual mm or category
        // New fields for hybrid scoring
        irrigationSource: {
            type: String,
            enum: ['Canal', 'Tubewell', 'Borewell', 'Open Well', 'River', 'Pond', 'Rainfall', 'Unknown'],
            default: 'Unknown'
        },
        marketRisk: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Unknown'],
            default: 'Medium'
        }
    },

    // --- Financial Details ---
    financialDetails: {
        annualIncome: { type: Number, default: 0 },
        externalIncome: { type: Number, default: 0 }, // Non-agri
        monthlyDebt: { type: Number, default: 0 }, // Existing EMI
        agriExpenditure: { type: Number, default: 0 },
        nonAgriExpenditure: { type: Number, default: 0 },
        pastIncomes: [{ type: Number }], // Last 3 years
        creditScore: { type: Number, default: -1 }, // External bureau score if available
        collateralAvailable: { type: Boolean, default: false },
        hasInsurance: { type: Boolean, default: false },
        // New fields for hybrid scoring
        scaleOfFinance: { type: Number, default: 0 }, // Cultivation cost
        repaymentHistory: {
            type: String,
            enum: ['On-Time', 'Delayed', 'Defaulted', 'Unknown'],
            default: 'Unknown'
        }
    },

    // --- HKCS Result (Computed) - Updated for Hybrid Scoring ---
    hkcsData: {
        score: { type: Number }, // Final Hybrid Score (0-100)
        ruleScore: { type: Number }, // Rule-based score component
        mlScore: { type: Number }, // ML-based score component
        creditGrade: { type: String, enum: ['A', 'B', 'C', 'D'] },
        creditGradeLabel: { type: String },
        calculatedAt: { type: Date },
        breakdown: { type: Map, of: Number },
        tips: [{ type: String }],
        riskReasons: [{ type: String }],
        recommendations: [{ type: String }],
        loanEligibility: {
            maxAmount: { type: Number },
            interestRate: { type: String },
            tenure: { type: String }
        }
    },

    aadhaarVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Drop old indexes on model compilation
FarmerSchema.on('index', function (err) {
    if (err) {
        console.error('Farmer index error:', err);
    }
});

// Hash password before saving
FarmerSchema.pre('save', async function () {
    // Only hash if password is modified (or new)
    if (!this.isModified('password')) {
        return;
    }

    // Generate salt with cost factor of 12
    const salt = await bcrypt.genSalt(12);
    // Hash password
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password using bcrypt
FarmerSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        return false;
    }
};

const Farmer = mongoose.model('Farmer', FarmerSchema);

// Drop the old mobile_1 unique index if it exists
Farmer.collection.dropIndex('mobile_1').catch(() => {
    // Index doesn't exist, that's fine
});

module.exports = Farmer;
