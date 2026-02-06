import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Sprout, IndianRupee, MapPin, Phone, ShieldCheck, Loader2 } from 'lucide-react';
import { PageHeader, Card, Button } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../config/api';

const Profile = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.AUTH.PROFILE, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                // If unauthorized, redirect to login
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    if (!user) return null;

    const { personalDetails = {}, farmingDetails = {}, financialDetails = {} } = user;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <PageHeader title={t('profile.title')} backAction={() => navigate('/home')} />

            <main className="p-4 max-w-lg mx-auto space-y-6">

                {/* Profile Header Card */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="bg-emerald-600 absolute top-0 left-0 right-0 h-24 z-0"></div>
                    <div className="w-24 h-24 bg-white rounded-full p-1 z-10 shadow-lg mb-3">
                        <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                            <User size={40} />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 z-10">{user.name || user.username}</h2>
                    <p className="text-slate-500 text-sm z-10">@{user.username}</p>

                    {user.aadhaarVerified && (
                        <span className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                            <ShieldCheck size={12} /> {t('profile.aadhaarVerified')}
                        </span>
                    )}
                </div>

                {/* Info Sections */}
                <Card title={t('profile.personalInfo')}>
                    <div className="space-y-4">
                        <InfoRow icon={Phone} label={t('profile.mobile')} value={personalDetails.phoneNumber || "--"} />
                        <InfoRow icon={MapPin} label={t('profile.location')} value={`${personalDetails.district || ""}, ${personalDetails.state || ""}`} />
                        <InfoRow icon={User} label={t('creditForm.age')} value={personalDetails.age ? `${personalDetails.age} Years` : "--"} />
                    </div>
                </Card>

                <Card title={t('profile.farmingProfile')}>
                    <div className="space-y-4">
                        <InfoRow icon={Sprout} label={t('profile.totalLand')} value={farmingDetails.totalLand ? `${farmingDetails.totalLand} Acres` : "--"} />
                        <InfoRow icon={Sprout} label={t('profile.crops')} value={farmingDetails.crops?.map(c => c.name).join(', ') || t('profile.notAdded')} />
                    </div>
                </Card>

                <Card title={t('profile.financialSnapshot')}>
                    <div className="space-y-4">
                        <InfoRow icon={IndianRupee} label={t('profile.annualIncome')} value={financialDetails.annualIncome ? `₹${financialDetails.annualIncome.toLocaleString()}` : "--"} />
                        <InfoRow icon={IndianRupee} label={t('profile.monthlyEmi')} value={financialDetails.monthlyDebt ? `₹${financialDetails.monthlyDebt.toLocaleString()}` : "--"} />
                    </div>
                </Card>

                <Button variant="secondary" onClick={() => navigate('/assess/credit-score')}>
                    {t('profile.updateDetails')}
                </Button>

                <div className="text-center pt-4">
                    <button onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }} className="text-red-500 text-sm font-medium hover:text-red-600 transition-colors">
                        {t('profile.signOut')}
                    </button>
                </div>

            </main>
        </div>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
        <div className="flex items-center gap-3">
            <div className="bg-slate-50 p-2 rounded-lg text-slate-500">
                <Icon size={18} />
            </div>
            <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
);

export default Profile;
