const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function verifySecurity() {
    console.log("🔐 Starting Security Verification...");

    const username = `testuser_${Date.now()}`;
    const password = 'password123';
    let token = '';
    let userId = '';

    // 1. Register
    try {
        console.log(`\n1. Registering user: ${username}`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            username,
            password,
            name: 'Test Farmer'
        });

        if (regRes.data.success && regRes.data.token) {
            console.log("✅ Registration Successful. Token received.");
            token = regRes.data.token;
            userId = regRes.data.user.id;
        } else {
            console.error("❌ Registration failed to return token.");
            return;
        }
    } catch (e) {
        console.error("❌ Registration Error:", e.response ? e.response.data : e.message);
        return;
    }

    // 2. Access Protected Route WITHOUT Token
    try {
        console.log(`\n2. Testing Unauthorized Access (should fail)`);
        await axios.post(`${API_URL}/score/calculate`, { personalDetails: { age: 30 } });
        console.error("❌ Endpoint accessible without token! SECURITY FAIL.");
    } catch (e) {
        if (e.response && e.response.status === 401) {
            console.log("✅ Unauthorized Access Blocked (401 received).");
        } else {
            console.error("❌ Unexpected error code:", e.response ? e.response.status : e.message);
        }
    }

    // 3. Access Protected Route WITH Token
    try {
        console.log(`\n3. Testing Authorized Access (should succeed)`);
        const scoreRes = await axios.post(
            `${API_URL}/score/calculate`,
            {
                personalDetails: { age: 35 },
                farmingDetails: { totalLand: 5, crops: [], rainfall: 800 },
                financialDetails: { annualIncome: 500000 }
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (scoreRes.data.success) {
            console.log("✅ Authorized Access Successful. Score calculated.");
            console.log("Score:", scoreRes.data.result.score);
        } else {
            console.error("❌ Calculation failed.");
        }

    } catch (e) {
        console.error("❌ Authorized Access Error:", e.response ? e.response.data : e.message);
    }

    console.log("\n🔐 Verification Complete.");
}

verifySecurity();
