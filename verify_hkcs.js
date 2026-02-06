const { calculateHKCS } = require('./server/utils/hkcsEngine');

const mockData = {
    personalDetails: { age: 35 },
    farmingDetails: {
        totalLand: 5,
        landOwned: 5,
        isTenant: false,
        farmingExperienceYears: 12,
        crops: [
            { name: 'Wheat', yieldPerAcre: 20 },
            { name: 'Mustard', yieldPerAcre: 15 } // Diversity +50
        ],
        rainfall: 800
    },
    financialDetails: {
        annualIncome: 600000,
        monthlyDebt: 5000,
        hasInsurance: true, // +50
        creditScore: 750, // +100
        pastIncomes: [600000, 550000] // Stable +50
    }
};

console.log("Running HKCS Verification...");

try {
    const result = calculateHKCS(mockData);
    console.log("------------------------------------------------");
    console.log("Score:", result.score);
    console.log("Breakdown:", result.breakdown);
    console.log("Tips:", result.tips);
    console.log("Loan Eligibility:", result.loanEligibility);
    console.log("------------------------------------------------");

    if (result.score > 700) {
        console.log("✅ High Score Logic Verified");
    } else {
        console.error("❌ Unexpected Low Score for ideal profile");
    }
} catch (error) {
    console.error("❌ Error running calculation:", error);
}
