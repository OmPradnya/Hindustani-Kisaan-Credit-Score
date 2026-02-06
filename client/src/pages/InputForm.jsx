import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tractor, Sprout, CloudRain, IndianRupee, User, ShieldCheck } from 'lucide-react';
import { API } from '../config/api';

const InputForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Complex State for all sections
    const [formData, setFormData] = useState({
        personalDetails: {
            name: 'Ram Lal',
            aadharNumber: '',
            phoneNumber: '',
            district: '',
            state: '',
            age: 45
        },
        farmingDetails: {
            totalLand: '',
            cultivatedLand: '',
            landOwned: '',
            isTenant: false,
            hasLeaseAgreement: false,
            farmingExperienceYears: 10,
            crops: [{ name: 'Wheat', area: 0, yieldPerAcre: 0 }],
            rainfall: 0,
        },
        financialDetails: {
            annualIncome: '',
            monthlyDebt: '',
            hasInsurance: false,
            creditScore: '', // Optional external score
            agriExpenditure: '',
            pastIncomes: [0, 0] // last 2 years
        }
    });

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleCropChange = (index, field, value) => {
        const newCrops = [...formData.farmingDetails.crops];
        newCrops[index][field] = value;
        handleNestedChange('farmingDetails', 'crops', newCrops);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Get User ID from localStorage if available (simple auth check)
            const userStr = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const user = userStr ? JSON.parse(userStr) : null;

            // We don't need to send userId in body anymore, middleware extracts it.
            // But we can keep it for now if needed, though clean up is better.
            const payload = { ...formData };

            const response = await fetch(API.SCORE.CALCULATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                navigate('/report', { state: { result: data.result } });
            } else {
                alert("Calculation failed. Server error.");
            }
        } catch (error) {
            console.error("Submission Error", error);
            // Fallback for demo if server offline? No, let's rely on server now.
            alert("Could not connect to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <header className="bg-brand-600 p-4 text-white shadow-md sticky top-0 z-10 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="hover:bg-white/20 p-1 rounded"><User size={20} /></button>
                <h1 className="text-xl font-bold">Farmer Profile & Assessment</h1>
            </header>

            <main className="p-4 max-w-2xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 1. Personal Details */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <User className="text-brand-500" size={20} /> Personal Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text" placeholder="Name" className="p-2 border rounded"
                                value={formData.personalDetails.name}
                                onChange={(e) => handleNestedChange('personalDetails', 'name', e.target.value)}
                            />
                            <input
                                type="number" placeholder="Age" className="p-2 border rounded"
                                value={formData.personalDetails.age}
                                onChange={(e) => handleNestedChange('personalDetails', 'age', Number(e.target.value))}
                            />
                            <input
                                type="text" placeholder="Phone Number" className="p-2 border rounded"
                                value={formData.personalDetails.phoneNumber}
                                onChange={(e) => handleNestedChange('personalDetails', 'phoneNumber', e.target.value)}
                            />
                            <input
                                type="text" placeholder="Aadhar (Last 4)" className="p-2 border rounded"
                                value={formData.personalDetails.aadharNumber}
                                onChange={(e) => handleNestedChange('personalDetails', 'aadharNumber', e.target.value)}
                            />
                            <input
                                type="text" placeholder="District" className="p-2 border rounded"
                                value={formData.personalDetails.district}
                                onChange={(e) => handleNestedChange('personalDetails', 'district', e.target.value)}
                            />
                            <input
                                type="text" placeholder="State" className="p-2 border rounded"
                                value={formData.personalDetails.state}
                                onChange={(e) => handleNestedChange('personalDetails', 'state', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* 2. Farming Details */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Tractor className="text-green-500" size={20} /> Farming & Land
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-gray-500">Total Land (Acres)</label>
                                <input
                                    type="number" className="w-full p-2 border rounded"
                                    value={formData.farmingDetails.totalLand}
                                    onChange={(e) => handleNestedChange('farmingDetails', 'totalLand', Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-gray-500">Founded/Cultivated (Acres)</label>
                                <input
                                    type="number" className="w-full p-2 border rounded"
                                    value={formData.farmingDetails.cultivatedLand}
                                    onChange={(e) => handleNestedChange('farmingDetails', 'cultivatedLand', Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">Ownership Status</label>
                                <div className="flex gap-4 mt-1">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.farmingDetails.landOwned > 0}
                                            onChange={() => handleNestedChange('farmingDetails', 'landOwned', formData.farmingDetails.landOwned ? 0 : formData.farmingDetails.totalLand)}
                                        /> Own Land
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.farmingDetails.isTenant}
                                            onChange={(e) => handleNestedChange('farmingDetails', 'isTenant', e.target.checked)}
                                        /> Tenant Farmer
                                    </label>
                                </div>
                            </div>

                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">Annual Rainfall (mm)</label>
                                <input
                                    type="number" className="w-full p-2 border rounded"
                                    value={formData.farmingDetails.rainfall}
                                    onChange={(e) => handleNestedChange('farmingDetails', 'rainfall', Number(e.target.value))}
                                />
                            </div>

                            {/* Crops Array (Simplified to 1 for demo but extensible) */}
                            <div className="col-span-2 border-t pt-4">
                                <label className="text-sm font-semibold text-gray-600 block mb-2">Primary Crop</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="text" placeholder="Crop Name" className="p-2 border rounded"
                                        value={formData.farmingDetails.crops[0].name}
                                        onChange={(e) => handleCropChange(0, 'name', e.target.value)}
                                    />
                                    <input
                                        type="number" placeholder="Area (Ac)" className="p-2 border rounded"
                                        value={formData.farmingDetails.crops[0].area}
                                        onChange={(e) => handleCropChange(0, 'area', Number(e.target.value))}
                                    />
                                    <input
                                        type="number" placeholder="Yield/Ac (Qt)" className="p-2 border rounded"
                                        value={formData.farmingDetails.crops[0].yieldPerAcre}
                                        onChange={(e) => handleCropChange(0, 'yieldPerAcre', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Financials */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <IndianRupee className="text-blue-500" size={20} /> Financials
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-gray-500">Annual Income (₹)</label>
                                <input
                                    type="number" className="w-full p-2 border rounded"
                                    value={formData.financialDetails.annualIncome}
                                    onChange={(e) => handleNestedChange('financialDetails', 'annualIncome', Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-gray-500">Total Monthly EMI (₹)</label>
                                <input
                                    type="number" className="w-full p-2 border rounded"
                                    value={formData.financialDetails.monthlyDebt}
                                    onChange={(e) => handleNestedChange('financialDetails', 'monthlyDebt', Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <label className="text-xs text-gray-500">Agri Expenditure (Yearly)</label>
                                <input
                                    type="number" className="w-full p-2 border rounded"
                                    value={formData.financialDetails.agriExpenditure}
                                    onChange={(e) => handleNestedChange('financialDetails', 'agriExpenditure', Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2 mt-2">
                                <label className="flex items-center gap-2 p-3 border rounded bg-gray-50">
                                    <input
                                        type="checkbox"
                                        checked={formData.financialDetails.hasInsurance}
                                        onChange={(e) => handleNestedChange('financialDetails', 'hasInsurance', e.target.checked)}
                                    />
                                    <span className="text-sm font-medium"><ShieldCheck size={16} className="inline mr-1" /> I have Crop Insurance</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 text-lg"
                    >
                        {loading ? 'Calculating...' : 'Calculate Eligibility'}
                    </button>

                </form>
            </main>
        </div>
    );
};

export default InputForm;
