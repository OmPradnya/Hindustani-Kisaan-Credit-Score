const { calculateHKCS } = require('./server/utils/hkcsEngine');

const data = {
    personalDetails: { age: 60 },
    farmingDetails: {
        totalLand: 2,
        landOwned: 0,
        isTenant: true,
        crops: [{ name: 'Rice', yieldPerAcre: 0 }],
        rainfall: 400
    },
    financialDetails: {
        annualIncome: 100000,
        monthlyDebt: 5000,
        hasInsurance: false,
        creditScore: 500
    }
};

const result = calculateHKCS(data);
console.log("Score:", result.score);
console.log("Tips:", result.tips);
console.log("Breakdown:", result.breakdown);
