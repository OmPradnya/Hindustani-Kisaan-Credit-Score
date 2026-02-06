/**
 * Hindustani Kisaan Credit Score (HKCS30) - Hybrid Scoring Engine
 * Combines Rule-based scoring (80%) with ML-based classification (20% influence)
 * 
 * Input fields:
 * - land_area: acres of cultivated land
 * - primary_crop: main crop grown
 * - secondary_crop: secondary crop or "None"
 * - cropping_pattern: "Single" or "Multi"
 * - irrigation: "Irrigated" or "Rainfed"
 * - years_experience: farming experience in years
 * - verification_status: "Verified" or "Unverified"
 */

const fetch = require('node-fetch');

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

// === Constants for Rule-Based Scoring ===

const MARKET_RISK = {
  "Wheat": 2.1, "Rice": 1.9, "Cotton": 4.2,
  "Soybean": 3.8, "Onion": 6.5, "Sugarcane": 1.5
};

const SCALE_OF_FINANCE = {
  "Wheat": 35000, "Rice": 42000, "Cotton": 48000,
  "Soybean": 32000, "Onion": 55000, "Sugarcane": 75000
};

const INCOME_PROXY = {
  "Wheat": 72000, "Rice": 80000, "Cotton": 95000,
  "Soybean": 60000, "Onion": 110000, "Sugarcane": 150000
};

// === Helper Functions ===

/**
 * Get ML prediction from Python service
 */
async function getMLPrediction(data) {
  try {
    const { farmingDetails } = data;

    // Derive primary and secondary crops from crops array
    const crops = farmingDetails?.crops || [];
    const primaryCrop = farmingDetails?.primaryCrop || crops[0]?.cropType || 'Wheat';
    const secondaryCrop = farmingDetails?.secondaryCrop || (crops.length > 1 ? crops[1]?.cropType : 'None');
    const croppingPattern = farmingDetails?.croppingPattern || (crops.length > 1 ? 'Multi' : 'Single');

    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        land_area: farmingDetails?.landArea || farmingDetails?.cultivatedLand || 1.0,
        primary_crop: primaryCrop,
        secondary_crop: secondaryCrop,
        cropping_pattern: croppingPattern,
        irrigation: farmingDetails?.irrigation || 'Rainfed',
        years_experience: farmingDetails?.yearsExperience || 1,
        verification_status: farmingDetails?.verificationStatus || 'Unverified'
      }),
      timeout: 5000
    });

    if (response.ok) {
      return await response.json();
    }
    console.error('ML service returned error status');
    return null;
  } catch (error) {
    console.error('ML service unavailable:', error.message);
    return null;
  }
}

/**
 * Fallback rule-based score calculation when ML service is unavailable
 */
function calculateFallbackScore(data) {
  const { farmingDetails } = data;

  // Derive crops from array
  const crops = farmingDetails?.crops || [];
  const landArea = parseFloat(farmingDetails?.landArea || farmingDetails?.cultivatedLand || 1.0);
  const primaryCrop = farmingDetails?.primaryCrop || crops[0]?.cropType || 'Wheat';
  const secondaryCrop = farmingDetails?.secondaryCrop || (crops.length > 1 ? crops[1]?.cropType : 'None');
  const croppingPattern = farmingDetails?.croppingPattern || (crops.length > 1 ? 'Multi' : 'Single');
  const irrigation = farmingDetails?.irrigation || 'Rainfed';
  const yearsExperience = parseInt(farmingDetails?.yearsExperience || 1);
  const verificationStatus = farmingDetails?.verificationStatus || 'Unverified';


  // Simulated repayment history
  const repaymentHistory = Math.floor(Math.random() * 61) + 40; // 40-100

  // Calculate combined metrics
  let risk, cost, income;
  if (croppingPattern === 'Single' || secondaryCrop === 'None') {
    risk = MARKET_RISK[primaryCrop] || 3.0;
    cost = SCALE_OF_FINANCE[primaryCrop] || 40000;
    income = INCOME_PROXY[primaryCrop] || 80000;
  } else {
    risk = ((MARKET_RISK[primaryCrop] || 3.0) + (MARKET_RISK[secondaryCrop] || 3.0)) / 2;
    cost = ((SCALE_OF_FINANCE[primaryCrop] || 40000) + (SCALE_OF_FINANCE[secondaryCrop] || 40000)) / 2;
    income = ((INCOME_PROXY[primaryCrop] || 80000) + (INCOME_PROXY[secondaryCrop] || 80000)) / 2;
  }

  // Score breakdown
  const breakdown = {
    landArea: Math.min(22, landArea * 3),
    cropping: croppingPattern === 'Multi' ? 14 : 8,
    repayment: (repaymentHistory / 100) * 18,
    irrigation: irrigation === 'Irrigated' ? 12 : 6,
    cost: (1 - (cost / 100000)) * 10,
    income: (income / 150000) * 8,
    experience: Math.min(6, yearsExperience / 5),
    marketRisk: (5 - risk),
    verification: verificationStatus === 'Verified' ? 5 : 2
  };

  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return {
    mlScore: totalScore,
    scoreBreakdown: breakdown,
    repaymentHistory,
    marketRisk: risk,
    decision: totalScore >= 65 ? 'APPROVED' : 'REJECTED'
  };
}

/**
 * Generate risk explanations based on farmer profile
 */
function generateRiskExplanations(data, breakdown) {
  const risks = [];
  const { farmingDetails } = data;

  const landArea = parseFloat(farmingDetails?.landArea || farmingDetails?.cultivatedLand || 0);
  const irrigation = farmingDetails?.irrigation || 'Rainfed';
  const verificationStatus = farmingDetails?.verificationStatus || 'Unverified';
  const yearsExperience = parseInt(farmingDetails?.yearsExperience || 0);

  if (landArea < 2) {
    risks.push('Small land holding increases vulnerability to crop failure.');
  }

  if (irrigation === 'Rainfed') {
    risks.push('Rainfall-dependent farming has high climate dependency risk.');
  }

  if (verificationStatus !== 'Verified') {
    risks.push('Unverified profile reduces trust score and loan eligibility.');
  }

  if (yearsExperience < 3) {
    risks.push('Limited farming experience may affect loan repayment capacity.');
  }

  const totalScore = Object.values(breakdown).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
  if (totalScore < 50) {
    risks.push('Overall agricultural risk profile is high.');
  }

  return risks;
}

/**
 * Generate improvement recommendations - Specific and actionable
 */
function generateRecommendations(data, finalScore, breakdown) {
  const recommendations = [];
  const { farmingDetails } = data;

  const landArea = parseFloat(farmingDetails?.landArea || farmingDetails?.cultivatedLand || 0);
  const irrigation = farmingDetails?.irrigation || 'Rainfed';
  const croppingPattern = farmingDetails?.croppingPattern || 'Single';
  const verificationStatus = farmingDetails?.verificationStatus || 'Unverified';
  const yearsExperience = parseInt(farmingDetails?.yearsExperience || 0);
  const primaryCrop = farmingDetails?.primaryCrop || 'Wheat';

  // === SCORE-BASED PRIORITY RECOMMENDATIONS ===
  if (finalScore < 50) {
    recommendations.push('🔴 PRIORITY ACTION: Your score is in the high-risk category. Focus on: (1) Get land and identity verified, (2) Switch to irrigated farming, (3) Consider multi-cropping.');
  } else if (finalScore < 65) {
    recommendations.push('🟡 IMPROVEMENT FOCUS: Score in moderate range. Top 2 actions: Improve irrigation and increase land area or crop diversity.');
  } else if (finalScore < 80) {
    recommendations.push('🟢 GOOD STANDING: You have a healthy credit profile. Consider applying for higher loan amounts or equipment financing.');
  } else {
    recommendations.push('✅ EXCELLENT PROFILE: You qualify for premium loan rates and higher limits. Consider expanding operations or investing in infrastructure.');
  }

  // === IRRIGATION RECOMMENDATIONS ===
  if (irrigation === 'Rainfed') {
    recommendations.push('💧 Install drip irrigation or micro-sprinklers - Government subsidies up to 90% available under PMKSY scheme. Contact your nearest Krishi Vigyan Kendra.');
  }

  // === LAND RECOMMENDATIONS ===
  if (landArea < 2) {
    recommendations.push('🌱 Increase cultivated land through leasing or cooperative farming. Join a Farmer Producer Organization (FPO) for collective benefits.');
  } else if (landArea < 5) {
    recommendations.push('📈 Maximize land productivity with intercropping or relay cropping to boost income per acre by 20-40%.');
  }

  // === CROPPING PATTERN RECOMMENDATIONS ===
  if (croppingPattern === 'Single') {
    recommendations.push('🌾 Consider multi-cropping with a secondary crop to diversify income sources and reduce market risk.');
  }

  // === VERIFICATION RECOMMENDATIONS ===
  if (verificationStatus !== 'Verified') {
    recommendations.push('✅ Complete Aadhaar and land record verification to increase trust score by 5-10%. Visit your nearest CSC or Tehsil office.');
  }

  // === EXPERIENCE RECOMMENDATIONS ===
  if (yearsExperience < 5) {
    recommendations.push('📚 Enroll in ATMA (Agriculture Technology Management Agency) training programs to improve farm management skills and access better credit.');
  }

  // === CROP-SPECIFIC RECOMMENDATIONS ===
  const highRiskCrops = ['Onion', 'Cotton'];
  if (highRiskCrops.includes(primaryCrop)) {
    recommendations.push(`⚠️ ${primaryCrop} has high price volatility. Consider adding stable crops like Wheat or Sugarcane to your portfolio for income stability.`);
  }

  return recommendations;
}

/**
 * Determine Credit Grade based on Final HKCS
 */
function getCreditGrade(score) {
  if (score >= 80) return { grade: 'A', label: 'Excellent' };
  if (score >= 65) return { grade: 'B', label: 'Good' };
  if (score >= 50) return { grade: 'C', label: 'Moderate' };
  return { grade: 'D', label: 'High Risk' };
}

// === Main HKCS Calculation Function ===

/**
 * Calculate Hybrid HKCS Score
 * ML Score with rule-based fallback
 */
const calculateHKCS = async (data) => {
  // === Try ML Service First ===
  let mlResult = await getMLPrediction(data);

  // Use fallback if ML service unavailable
  if (!mlResult) {
    mlResult = calculateFallbackScore(data);
  }

  const finalScore = mlResult.mlScore || 50;
  const roundedFinalScore = Math.round(finalScore * 100) / 100;

  // === Get Credit Grade ===
  const { grade, label: gradeLabel } = getCreditGrade(roundedFinalScore);

  // === Build breakdown from ML result ===
  const breakdown = mlResult.scoreBreakdown || {};

  // === Generate Explanations & Recommendations ===
  const riskReasons = generateRiskExplanations(data, breakdown);
  const recommendations = mlResult.recommendations || generateRecommendations(data, roundedFinalScore, breakdown);

  // === Calculate Loan Eligibility ===
  const loanEligibility = calculateLoanEligibility({
    ...data,
    creditScore: roundedFinalScore * 10 // Convert to 1000 scale for loan calc
  });

  return {
    // Scores
    score: roundedFinalScore,
    ruleScore: roundedFinalScore, // For backward compatibility
    mlScore: roundedFinalScore,

    // Grade
    creditGrade: grade,
    creditGradeLabel: gradeLabel,

    // Decision
    decision: mlResult.decision || (roundedFinalScore >= 65 ? 'APPROVED' : 'REJECTED'),

    // Breakdown
    breakdown: {
      ...breakdown,
      landStability: (breakdown.landArea || 0) + (breakdown.irrigation || 0),
      production: (breakdown.cropping || 0) + (breakdown.marketRisk || 0),
      financial: (breakdown.income || 0) + (breakdown.cost || 0) + (breakdown.repayment || 0),
      personal: (breakdown.experience || 0) + (breakdown.verification || 0)
    },

    // Insights
    riskReasons,
    tips: recommendations,
    recommendations,

    // Additional data
    repaymentHistory: mlResult.repaymentHistory,
    marketRisk: mlResult.marketRisk,

    // Loan Eligibility
    loanEligibility
  };
};

// === Loan Eligibility Engine ===

const calculateLoanEligibility = (data) => {
  const { farmingDetails, creditScore } = data;

  const landArea = parseFloat(farmingDetails?.landArea || farmingDetails?.cultivatedLand || 0);
  const primaryCrop = farmingDetails?.primaryCrop || 'Wheat';
  const verificationStatus = farmingDetails?.verificationStatus || 'Unverified';

  let isEligible = true;
  let maxAmount = 0;
  let interestRate = "12%";
  let tenure = "1 Year";
  const reasons = [];

  // 1. Basic Eligibility Checks
  if (verificationStatus !== 'Verified') {
    reasons.push("Complete document verification to access higher loan limits.");
  }

  // 2. Max Loan Amount Calculation based on land and crop
  const incomeProxy = INCOME_PROXY[primaryCrop] || 80000;
  const baseLimit = incomeProxy * landArea * 0.5;

  if (creditScore >= 750) {
    maxAmount = baseLimit * 1.5;
  } else if (creditScore >= 650) {
    maxAmount = baseLimit * 1.2;
  } else if (creditScore >= 500) {
    maxAmount = baseLimit;
  } else {
    maxAmount = baseLimit * 0.5;
    if (creditScore < 400) {
      isEligible = false;
      reasons.push("Credit score too low for loan eligibility. Improve profile first.");
    }
  }

  // Cap amounts based on verification
  if (verificationStatus !== 'Verified') {
    maxAmount = Math.min(maxAmount, 100000);
  } else {
    maxAmount = Math.min(maxAmount, 500000);
  }

  // 3. Interest Rate Determination
  let rate = 9.0;
  if (creditScore >= 750) rate = 7.0;
  else if (creditScore >= 650) rate = 8.5;
  else if (creditScore >= 550) rate = 10.0;
  else rate = 12.0;

  if (rate < 4.0) rate = 4.0;
  interestRate = `${rate.toFixed(1)}%`;

  // 4. Tenure
  tenure = "12 Months (Seasonal)";
  if (maxAmount > 200000) {
    tenure = "36-60 Months (Term Loan)";
  }

  return {
    isEligible,
    maxEligibleAmount: Math.floor(Math.max(0, maxAmount)),
    maxAmount: Math.floor(Math.max(0, maxAmount)),
    interestRate,
    tenure,
    reasons
  };
};

module.exports = { calculateHKCS, calculateLoanEligibility };
