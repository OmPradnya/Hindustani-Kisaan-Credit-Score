const Farmer = require('../models/Farmer');
const { calculateHKCS, calculateLoanEligibility } = require('../utils/hkcsEngine');

/**
 * Calculate HKCS Score and optionally save to Farmer profile
 * Route: POST /api/score/calculate
 */
const calculateAndSaveScore = async (req, res) => {
    try {
        const inputData = req.body;
        const userId = req.user._id; // Retrieved from Auth Middleware

        // 1. Calculate Score (Now async for ML integration)
        const result = await calculateHKCS(inputData);

        // 2. Save to DB if userId provided
        if (userId) {
            const farmer = await Farmer.findById(userId);
            if (farmer) {
                // Update Farmer Profile
                if (inputData.personalDetails) farmer.personalDetails = { ...farmer.personalDetails, ...inputData.personalDetails };
                if (inputData.farmingDetails) farmer.farmingDetails = { ...farmer.farmingDetails, ...inputData.farmingDetails };
                if (inputData.financialDetails) farmer.financialDetails = { ...farmer.financialDetails, ...inputData.financialDetails };

                // Save Hybrid HKCS Result
                farmer.hkcsData = {
                    score: result.score,
                    ruleScore: result.ruleScore,
                    mlScore: result.mlScore,
                    creditGrade: result.creditGrade,
                    creditGradeLabel: result.creditGradeLabel,
                    calculatedAt: new Date(),
                    breakdown: result.breakdown,
                    tips: result.tips,
                    riskReasons: result.riskReasons,
                    recommendations: result.recommendations,
                    loanEligibility: result.loanEligibility
                };

                await farmer.save();
                console.log(`✅ Updated hybrid score for farmer: ${farmer.username} - Grade: ${result.creditGrade}`);
            } else {
                console.warn(`Farmer with ID ${userId} not found, returning result without saving.`);
            }
        }

        res.json({ success: true, result });

    } catch (error) {
        console.error("Scoring Controller Error:", error);
        res.status(500).json({ success: false, message: "Error calculating score" });
    }
};

/**
 * Calculate Loan Eligibility
 * Route: POST /api/loan/calculate
 */
const calculateLoan = async (req, res) => {
    try {
        const inputData = req.body;
        // Logic specific to loan eligibility
        const result = calculateLoanEligibility(inputData);
        res.json({ success: true, result });
    } catch (error) {
        console.error("Loan Controller Error:", error);
        res.status(500).json({ success: false, message: "Error calculating loan eligibility" });
    }
};

/**
 * Get latest score for a farmer
 * Route: GET /api/score/:userId
 */
const getScore = async (req, res) => {
    try {
        const { userId } = req.params;

        if (userId !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: "Not authorized to view this score" });
        }

        const farmer = await Farmer.findById(userId);

        if (!farmer || !farmer.hkcsData || !farmer.hkcsData.score) {
            return res.status(404).json({ success: false, message: "Score not found" });
        }

        res.json({ success: true, result: farmer.hkcsData });
    } catch (error) {
        console.error("Get Score Error:", error);
        res.status(500).json({ success: false, message: "Error fetching score" });
    }
}

module.exports = { calculateAndSaveScore, calculateLoan, getScore };
