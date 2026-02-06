const { calculateHKCS, calculateLoanEligibility } = require('../utils/hkcsEngine');

describe('HKCS Hybrid Engine Verification', () => {

    test('should calculate high score with on-time repayment and good irrigation', async () => {
        const mockData = {
            personalDetails: { age: 35 },
            farmingDetails: {
                totalLand: 8,
                cultivatedLand: 7,
                landOwned: 8,
                isTenant: false,
                farmingExperienceYears: 12,
                irrigationSource: 'Canal',
                marketRisk: 'Low',
                crops: [
                    { name: 'Cotton', yieldPerAcre: 20 },
                    { name: 'Wheat', yieldPerAcre: 15 }
                ],
                rainfall: 850
            },
            financialDetails: {
                annualIncome: 400000,
                monthlyDebt: 5000,
                hasInsurance: true,
                creditScore: 750,
                scaleOfFinance: 150000,
                repaymentHistory: 'On-Time',
                pastIncomes: [350000, 300000]
            }
        };

        const result = await calculateHKCS(mockData);

        // Score components based on new formula:
        // Land: 22 (>=6 acres)
        // Crop: 14 (Cotton = cash crop)
        // Repayment: 18 (On-Time)
        // Irrigation: 12 (Canal)
        // Scale: 10 (>=120000)
        // Income: 8 (>=250000)
        // Market: 5 (Low)
        // Total Rule: 89/89 = 100%

        expect(result.score).toBeGreaterThan(70);
        expect(result.creditGrade).toBe('A');
        expect(result.ruleScore).toBeGreaterThan(80);
        expect(result.mlScore).toBeGreaterThan(0);
        expect(result.recommendations.length).toBeGreaterThan(0);
    });

    test('should calculate low score with defaulted repayment and rainfall irrigation', async () => {
        const data = {
            personalDetails: { age: 60 },
            farmingDetails: {
                totalLand: 2,
                cultivatedLand: 0.5,
                landOwned: 0,
                isTenant: true,
                irrigationSource: 'Rainfall',
                marketRisk: 'High',
                crops: [{ name: 'Rice', yieldPerAcre: 5 }],
                rainfall: 400
            },
            financialDetails: {
                annualIncome: 60000,
                monthlyDebt: 3000,
                hasInsurance: false,
                creditScore: 400,
                scaleOfFinance: 30000,
                repaymentHistory: 'Defaulted'
            }
        };

        const result = await calculateHKCS(data);

        // Low scores expected:
        // Land: 8 (<1 acre)
        // Crop: 10 (Rice = food crop)
        // Repayment: 2 (Defaulted)
        // Irrigation: 2 (Rainfall)
        // Scale: 6 (<50000)
        // Income: 3 (<80000)
        // Market: 1 (High)
        // Total Rule: 32/89 = ~36%

        expect(result.score).toBeLessThan(50);
        expect(result.creditGrade).toBe('D');
        expect(result.riskReasons.length).toBeGreaterThan(0);
    });

    test('should return correct credit grades for boundary scores', async () => {
        // Test Grade A boundary (>=80)
        const highScoreData = {
            farmingDetails: {
                cultivatedLand: 8,
                irrigationSource: 'Canal',
                marketRisk: 'Low',
                crops: [{ name: 'Cotton' }]
            },
            financialDetails: {
                annualIncome: 300000,
                scaleOfFinance: 150000,
                repaymentHistory: 'On-Time'
            }
        };

        const highResult = await calculateHKCS(highScoreData);
        expect(['A', 'B']).toContain(highResult.creditGrade);
    });

    test('should include loan eligibility in result', async () => {
        const data = {
            personalDetails: { age: 40 },
            farmingDetails: {
                cultivatedLand: 5,
                irrigationSource: 'Borewell',
                marketRisk: 'Medium',
                crops: [{ name: 'Wheat' }]
            },
            financialDetails: {
                annualIncome: 200000,
                scaleOfFinance: 80000,
                repaymentHistory: 'On-Time'
            }
        };

        const result = await calculateHKCS(data);

        expect(result.loanEligibility).toBeDefined();
        expect(result.loanEligibility.maxEligibleAmount).toBeGreaterThan(0);
        expect(result.loanEligibility.interestRate).toBeDefined();
        expect(result.loanEligibility.tenure).toBeDefined();
    });

    test('should generate appropriate risk reasons', async () => {
        const riskyData = {
            farmingDetails: {
                cultivatedLand: 1,
                irrigationSource: 'Rainfall',
                marketRisk: 'High',
                crops: [{ name: 'Rice' }]
            },
            financialDetails: {
                annualIncome: 50000,
                scaleOfFinance: 20000,
                repaymentHistory: 'Delayed'
            }
        };

        const result = await calculateHKCS(riskyData);

        expect(result.riskReasons.length).toBeGreaterThan(2);
        expect(result.riskReasons.some(r => r.includes('Rainfall'))).toBe(true);
        expect(result.riskReasons.some(r => r.includes('income') || r.includes('repayment'))).toBe(true);
    });

});
