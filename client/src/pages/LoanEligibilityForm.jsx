import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { PageHeader, Card, Input, Button } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../config/api';

const LoanEligibilityForm = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const [formData, setFormData] = useState({
        age: '',
        farmingExperienceYears: '',
        landOwnedAcres: '',
        isTenant: false,
        hasLeaseAgreement: false,
        annualIncome: '',
        existingMonthlyDebt: '',
        loanAmountRequired: '',
        creditScore: '',
        collateralAvailable: '',
        insurance: false
    });

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API.LOAN.CALCULATE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                const data = await response.json();
                setResult(data.result);
            } else {
                alert("Calculation failed.");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full animate-fade-in-up">
                    <Card className="overflow-hidden border-none shadow-xl">
                        <div className={`p-8 text-white text-center -mx-5 -mt-5 mb-6 ${result.isEligible ? 'bg-emerald-600' : 'bg-red-500'}`}>
                            <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                {result.isEligible ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                            </div>
                            <h2 className="text-2xl font-bold">{result.isEligible ? t('loanForm.preApproved') : t('loanForm.notEligible')}</h2>
                            {!result.isEligible && <p className="text-white/80 text-sm mt-1">{t('loanForm.reviewFactors')}</p>}
                        </div>

                        <div className="space-y-6">
                            {result.isEligible ? (
                                <>
                                    <div className="text-center">
                                        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{t('loanForm.maxAmount')}</p>
                                        <p className="text-4xl font-extrabold text-slate-800">₹{result.maxEligibleAmount.toLocaleString()}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                            <p className="text-slate-400 text-xs">{t('loanForm.interestRate')}</p>
                                            <p className="font-bold text-emerald-600 text-lg">{result.interestRate}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl text-center">
                                            <p className="text-slate-400 text-xs">{t('loanForm.tenure')}</p>
                                            <p className="font-bold text-emerald-600 text-lg">{result.tenure}</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                    <h4 className="font-semibold text-red-700 mb-2 text-sm">{t('loanForm.actionNeeded')}</h4>
                                    <ul className="space-y-2">
                                        {result.reasons.map((r, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                                                <div className="min-w-[4px] h-[4px] rounded-full bg-red-400 mt-2"></div>
                                                {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button variant="secondary" onClick={() => setResult(null)} icon={RotateCcw}>{t('loanForm.checkAgain')}</Button>
                                <Button onClick={() => navigate('/home')}>{t('loanForm.done')}</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <PageHeader
                title={t('loanForm.title')}
                subtitle={t('loanForm.subtitle')}
                backAction={() => navigate(-1)}
            />

            <main className="p-4 max-w-2xl mx-auto mt-2">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card title={t('loanForm.borrowerProfile')}>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label={t('loanForm.age')} type="number" value={formData.age} onChange={v => handleChange('age', Number(v))} />
                            <Input label={t('loanForm.experience')} type="number" value={formData.farmingExperienceYears} onChange={v => handleChange('farmingExperienceYears', Number(v))} />
                        </div>
                    </Card>

                    <Card title={t('loanForm.landIncome')}>
                        <div className="space-y-4">
                            <Input label={t('loanForm.landOwned')} type="number" value={formData.landOwnedAcres} onChange={v => handleChange('landOwnedAcres', Number(v))} />

                            <div className="flex flex-col gap-3 bg-slate-50 p-4 rounded-xl">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={formData.isTenant} onChange={e => handleChange('isTenant', e.target.checked)} className="w-5 h-5 accent-emerald-600" />
                                    <span className="text-sm font-medium text-slate-700">{t('loanForm.tenantFarmer')}</span>
                                </label>
                                {formData.isTenant && (
                                    <label className="flex items-center gap-3 cursor-pointer ml-6 animate-fade-in-up">
                                        <input type="checkbox" checked={formData.hasLeaseAgreement} onChange={e => handleChange('hasLeaseAgreement', e.target.checked)} className="w-5 h-5 accent-emerald-600" />
                                        <span className="text-sm font-medium text-slate-700">{t('loanForm.leaseAgreement')}</span>
                                    </label>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input label={t('loanForm.annualIncome')} type="number" value={formData.annualIncome} onChange={v => handleChange('annualIncome', Number(v))} />
                                <Input label={t('loanForm.monthlyEmi')} type="number" value={formData.existingMonthlyDebt} onChange={v => handleChange('existingMonthlyDebt', Number(v))} />
                            </div>
                        </div>
                    </Card>

                    <Card title={t('loanForm.loanRequirement')}>
                        <div className="space-y-4">
                            <Input label={t('loanForm.amountRequired')} type="number" value={formData.loanAmountRequired} onChange={v => handleChange('loanAmountRequired', Number(v))} />
                            <Input label={t('loanForm.collateralValue')} type="number" placeholder={t('loanForm.enterZero')} value={formData.collateralAvailable} onChange={v => handleChange('collateralAvailable', Number(v))} />

                            <div className="pt-2">
                                <Input label={t('loanForm.creditScoreOptional')} type="number" value={formData.creditScore} onChange={v => handleChange('creditScore', Number(v))} />
                            </div>

                            <label className="flex items-center gap-3 p-4 border rounded-xl bg-emerald-50/50 border-emerald-100 cursor-pointer hover:bg-emerald-50 transition-colors">
                                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><ShieldCheck size={20} /></div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-emerald-900 block">{t('loanForm.cropInsurance')}</span>
                                    <span className="text-xs text-emerald-700">{t('loanForm.validCoverage')}</span>
                                </div>
                                <input type="checkbox" checked={formData.insurance} onChange={e => handleChange('insurance', e.target.checked)} className="w-6 h-6 accent-emerald-600" />
                            </label>
                        </div>
                    </Card>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-20">
                        <div className="max-w-2xl mx-auto">
                            <Button type="submit" isLoading={loading} icon={CreditCard}>
                                {t('loanForm.checkEligibility')}
                            </Button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default LoanEligibilityForm;
