import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CreditScoreForm from './pages/CreditScoreForm';
import LoanEligibilityForm from './pages/LoanEligibilityForm';
// import InputForm from './pages/InputForm'; // Deprecated
// import Dashboard from './pages/Dashboard'; // Old dashboard
import ScoreReport from './pages/ScoreReport'; // Renamed Dashboard
import Home from './pages/Home'; // New Hub

import { LanguageProvider } from './context/LanguageContext';
import Profile from './pages/Profile'; // Ensure imported

function App() {
    return (
        <LanguageProvider>
            <Router>
                <div className="min-h-screen font-sans">
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/home" element={<Home />} />
                        {/* <Route path="/home" element={<Home />} /> Removed duplicate */}
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/assess" element={<CreditScoreForm />} />
                        <Route path="/assess/credit-score" element={<CreditScoreForm />} />
                        <Route path="/assess/loan-eligibility" element={<LoanEligibilityForm />} />
                        <Route path="/report" element={<ScoreReport />} />
                    </Routes>
                </div>
            </Router>
        </LanguageProvider>
    );
}

export default App;
