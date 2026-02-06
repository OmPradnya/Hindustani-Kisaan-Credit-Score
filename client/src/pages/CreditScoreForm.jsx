import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, User, LineChart, Droplets, Award, Calendar, CheckCircle, Plus, Trash2, Wheat } from 'lucide-react';
import { PageHeader, Card, Input, Button } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../config/api';

const CreditScoreForm = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        personalDetails: {
            name: '', aadharNumber: '', phoneNumber: '', district: '', state: '', age: ''
        },
        farmingDetails: {
            landArea: '',
            crops: [{ cropType: 'Wheat', area: '', yieldPerAcre: '' }],
            irrigation: 'Rainfed',
            yearsExperience: '',
            verificationStatus: 'Unverified'
        }
    });

    const handleNestedChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [field]: value }
        }));
    };

    // Handle crop list changes
    const handleCropChange = (index, field, value) => {
        const newCrops = [...formData.farmingDetails.crops];
        newCrops[index][field] = value;
        handleNestedChange('farmingDetails', 'crops', newCrops);
    };

    // Add new crop entry
    const addCrop = () => {
        const newCrops = [...formData.farmingDetails.crops, { cropType: 'Wheat', area: '', yieldPerAcre: '' }];
        handleNestedChange('farmingDetails', 'crops', newCrops);
    };

    // Remove crop entry
    const removeCrop = (index) => {
        if (formData.farmingDetails.crops.length > 1) {
            const newCrops = formData.farmingDetails.crops.filter((_, i) => i !== index);
            handleNestedChange('farmingDetails', 'crops', newCrops);
        }
    };

    // Derive cropping pattern from number of crops
    const getCroppingPattern = () => {
        return formData.farmingDetails.crops.length > 1 ? 'Multi' : 'Single';
    };

    // Get primary and secondary crops for ML model
    const getPrimaryCrop = () => {
        return formData.farmingDetails.crops[0]?.cropType || 'Wheat';
    };

    const getSecondaryCrop = () => {
        return formData.farmingDetails.crops.length > 1
            ? formData.farmingDetails.crops[1]?.cropType
            : 'None';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Prepare data with derived fields for ML model
            const submitData = {
                ...formData,
                farmingDetails: {
                    ...formData.farmingDetails,
                    primaryCrop: getPrimaryCrop(),
                    secondaryCrop: getSecondaryCrop(),
                    croppingPattern: getCroppingPattern()
                }
            };

            const response = await fetch(API.SCORE.CALCULATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(submitData)
            });
            if (response.ok) {
                const data = await response.json();
                navigate('/report', { state: { result: data.result } });
            } else {
                alert("Score calculation failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    // Crop options
    const cropOptions = [
        { value: 'Wheat', label: t('creditForm.cropWheat') || 'Wheat' },
        { value: 'Rice', label: t('creditForm.cropRice') || 'Rice' },
        { value: 'Cotton', label: t('creditForm.cropCotton') || 'Cotton' },
        { value: 'Soybean', label: t('creditForm.cropSoybean') || 'Soybean' },
        { value: 'Onion', label: t('creditForm.cropOnion') || 'Onion' },
        { value: 'Sugarcane', label: t('creditForm.cropSugarcane') || 'Sugarcane' }
    ];

    // Irrigation options
    const irrigationOptions = [
        { value: 'Irrigated', label: t('creditForm.irrigated') || 'Irrigated' },
        { value: 'Rainfed', label: t('creditForm.rainfed') || 'Rainfed' }
    ];

    // Verification status options
    const verificationOptions = [
        { value: 'Verified', label: t('creditForm.verified') || 'Verified' },
        { value: 'Unverified', label: t('creditForm.unverified') || 'Unverified' }
    ];

    // Styled select component
    const SelectField = ({ label, icon: Icon, value, onChange, options, className = '' }) => (
        <div className={className}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
                {Icon && <Icon size={16} className="inline mr-2 text-emerald-500" />}
                {label}
            </label>
            <select
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <PageHeader
                title={t('creditForm.title')}
                subtitle={t('creditForm.subtitle')}
                backAction={() => navigate(-1)}
            />

            <main className="p-4 max-w-2xl mx-auto space-y-6 mt-2">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Personal Details */}
                    <Card title={t('creditForm.personalDetails')}>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label={t('creditForm.name')} value={formData.personalDetails.name} onChange={v => handleNestedChange('personalDetails', 'name', v)} className="col-span-2" />
                            <Input label={t('creditForm.age')} type="number" value={formData.personalDetails.age} onChange={v => handleNestedChange('personalDetails', 'age', Number(v))} />
                            <Input label={t('creditForm.phone')} value={formData.personalDetails.phoneNumber} onChange={v => handleNestedChange('personalDetails', 'phoneNumber', v)} />
                            <Input label={t('creditForm.aadhar')} value={formData.personalDetails.aadharNumber} onChange={v => handleNestedChange('personalDetails', 'aadharNumber', v)} className="col-span-2" />
                            <Input label={t('creditForm.district')} value={formData.personalDetails.district} onChange={v => handleNestedChange('personalDetails', 'district', v)} />
                            <Input label={t('creditForm.state')} value={formData.personalDetails.state} onChange={v => handleNestedChange('personalDetails', 'state', v)} />
                        </div>
                    </Card>

                    {/* Farming Details */}
                    <Card title={t('creditForm.farmingData')}>
                        <div className="space-y-4">
                            {/* Land Area */}
                            <Input
                                label={t('creditForm.landArea') || 'Land Area (Acres)'}
                                type="number"
                                value={formData.farmingDetails.landArea}
                                onChange={v => handleNestedChange('farmingDetails', 'landArea', Number(v))}
                            />

                            {/* Cropping Pattern - Dynamic List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="block text-sm font-medium text-slate-700">
                                        <Wheat size={16} className="inline mr-2 text-amber-500" />
                                        {t('creditForm.croppingPattern') || 'Cropping Pattern'}
                                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getCroppingPattern() === 'Multi' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                            {getCroppingPattern() === 'Multi' ? (t('creditForm.patternMulti') || 'Multi Crop') : (t('creditForm.patternSingle') || 'Single Crop')}
                                        </span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addCrop}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                    >
                                        <Plus size={16} />
                                        {t('creditForm.addCrop') || 'Add Crop'}
                                    </button>
                                </div>

                                {/* Crop Entries */}
                                <div className="space-y-3">
                                    {formData.farmingDetails.crops.map((crop, index) => (
                                        <div key={index} className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative">
                                            {formData.farmingDetails.crops.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCrop(index)}
                                                    className="absolute top-3 right-3 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <div className="flex items-center gap-2 mb-3">
                                                <Sprout size={16} className="text-emerald-600" />
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {index === 0 ? (t('creditForm.primaryCrop') || 'Primary Crop') : `${t('creditForm.crop') || 'Crop'} ${index + 1}`}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <SelectField
                                                    label={t('creditForm.cropType') || 'Crop Type'}
                                                    value={crop.cropType}
                                                    onChange={v => handleCropChange(index, 'cropType', v)}
                                                    options={cropOptions}
                                                />
                                                <Input
                                                    label={t('creditForm.area') || 'Area (Acres)'}
                                                    type="number"
                                                    value={crop.area}
                                                    onChange={v => handleCropChange(index, 'area', Number(v))}
                                                />
                                                <Input
                                                    label={t('creditForm.yieldPerAcre') || 'Yield/Acre (Qt)'}
                                                    type="number"
                                                    value={crop.yieldPerAcre}
                                                    onChange={v => handleCropChange(index, 'yieldPerAcre', Number(v))}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Irrigation Type */}
                            <SelectField
                                label={t('creditForm.irrigationType') || 'Irrigation Type'}
                                icon={Droplets}
                                value={formData.farmingDetails.irrigation}
                                onChange={v => handleNestedChange('farmingDetails', 'irrigation', v)}
                                options={irrigationOptions}
                            />

                            {/* Years of Experience */}
                            <Input
                                label={t('creditForm.yearsExperience') || 'Years of Experience'}
                                type="number"
                                icon={Calendar}
                                value={formData.farmingDetails.yearsExperience}
                                onChange={v => handleNestedChange('farmingDetails', 'yearsExperience', Number(v))}
                            />
                        </div>
                    </Card>

                    {/* Verification Status */}
                    <Card title={t('creditForm.verificationSection') || 'Verification'}>
                        <SelectField
                            label={t('creditForm.verificationStatus') || 'Verification Status'}
                            icon={CheckCircle}
                            value={formData.farmingDetails.verificationStatus}
                            onChange={v => handleNestedChange('farmingDetails', 'verificationStatus', v)}
                            options={verificationOptions}
                        />
                        <p className="text-sm text-slate-500 mt-2">
                            {t('creditForm.verificationHelp') || 'Select "Verified" if your Aadhaar and land records are verified.'}
                        </p>
                    </Card>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-20">
                        <div className="max-w-2xl mx-auto">
                            <Button type="submit" isLoading={loading} icon={LineChart}>
                                {t('creditForm.calculateScore')}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default CreditScoreForm;
