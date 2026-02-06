const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
    inputData: {
        irrigationType: String,
        cropDiversity: String,
        yieldConsistency: String,
        environmentRisk: String,
        landSize: Number,
        cropType: String
    },
    result: {
        score: Number,
        breakdown: Object,
        loanEligibility: Object,
        tips: [String]
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
