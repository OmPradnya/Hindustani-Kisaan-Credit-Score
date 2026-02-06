// API Configuration - uses environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API = {
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        PROFILE: `${API_BASE_URL}/api/auth/profile`,
    },
    SCORE: {
        CALCULATE: `${API_BASE_URL}/api/score/calculate`,
        GET: (userId) => `${API_BASE_URL}/api/score/${userId}`,
    },
    LOAN: {
        CALCULATE: `${API_BASE_URL}/api/loan/calculate`,
    }
};

export default API_BASE_URL;
