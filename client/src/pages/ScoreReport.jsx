import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { PageHeader, Card, Button } from '../components/ui';
import { CheckCircle2, AlertTriangle, Sprout, TrendingUp, Shield, PieChart, Info, IndianRupee, Cpu, Scale, Award } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../config/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const ScoreReport = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [result, setResult] = useState(state?.result || null);
    const [loading, setLoading] = useState(!state?.result);
    // User ID from local storage to fetch proper score
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Fetch score if not passed in state
    useEffect(() => {
        if (!result && user.id) {
            const fetchScore = async () => {
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(API.SCORE.GET(user.id), {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setResult(data.result);
                    }
                } catch (error) {
                    console.error("Failed to fetch score history:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchScore();
        } else if (!result && !user.id) {
            setLoading(false);
        }
    }, [result, user.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info size={32} className="text-slate-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">{t('report.noReport')}</h2>
                    <p className="text-slate-500 mb-6">{t('report.completeAssessment')}</p>
                    <Button onClick={() => navigate('/home')}>{t('report.goHome')}</Button>
                </div>
            </div>
        );
    }

    const { score, ruleScore, mlScore, creditGrade, creditGradeLabel, loanEligibility, tips, riskReasons, recommendations, breakdown = {} } = result;

    // Convert scores to 1000 scale for display
    const displayScore = Math.round((score || 0) * 10);
    const displayRuleScore = Math.round((ruleScore || 0) * 10);
    const displayMlScore = Math.round((mlScore || 0) * 10);

    // Report Colors based on credit grade
    const gradeColors = {
        'A': { color: '#10b981', light: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-500' },
        'B': { color: '#3b82f6', light: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-500' },
        'C': { color: '#eab308', light: 'bg-yellow-50', text: 'text-yellow-700', ring: 'ring-yellow-500' },
        'D': { color: '#ef4444', light: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-500' }
    };

    const gradeStyle = gradeColors[creditGrade] || gradeColors['C'];

    // Chart still uses 0-100 internally for the arc
    const chartData = {
        labels: ['Score', 'Remaining'],
        datasets: [{
            data: [score || 0, 100 - (score || 0)],
            backgroundColor: [gradeStyle.color, '#f1f5f9'],
            borderWidth: 0,
            circumference: 220,
            rotation: 250,
            borderRadius: 20,
        }],
    };

    const chartOptions = {
        cutout: '85%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-10">
            <PageHeader title={t('report.title')} backAction={() => navigate('/home')} />

            <main className="p-4 max-w-lg mx-auto space-y-6">

                {/* Main Score Card with Credit Grade */}
                <Card className="text-center relative overflow-hidden pt-8 pb-8">
                    <h2 className="text-slate-400 font-medium text-sm tracking-widest uppercase mb-4">{t('report.hkcsScore')}</h2>

                    <div className="h-48 relative flex justify-center items-center">
                        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
                            <span className="text-6xl font-black text-slate-800 tracking-tighter">{displayScore}</span>
                            <span className={`text-sm font-bold px-4 py-1.5 rounded-full mt-2 ${gradeStyle.light} ${gradeStyle.text}`}>
                                {creditGradeLabel || (creditGrade === 'A' ? t('report.excellent') : creditGrade === 'B' ? t('report.good') : creditGrade === 'C' ? t('report.fair') : t('report.needsImprovement'))}
                            </span>
                        </div>
                        <div className="w-56 h-56">
                            <Doughnut data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Credit Grade Badge */}
                    <div className="mt-4 flex justify-center">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${gradeStyle.light} ${gradeStyle.text} ring-2 ${gradeStyle.ring}`}>
                            <Award size={18} />
                            <span className="font-bold">Grade {creditGrade}</span>
                        </div>
                    </div>
                </Card>

                {/* Hybrid Score Breakdown - Rule vs ML */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Scale size={18} className="text-purple-500" />
                            <span className="text-xs font-semibold text-slate-400 uppercase">{t('report.ruleScore')}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800">{displayRuleScore}</span>
                            <span className="text-xs text-slate-400">/1000</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">70% weight</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-2 mb-2">
                            <Cpu size={18} className="text-blue-500" />
                            <span className="text-xs font-semibold text-slate-400 uppercase">{t('report.mlScore')}</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-800">{displayMlScore}</span>
                            <span className="text-xs text-slate-400">/1000</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">30% weight</p>
                    </div>
                </div>

                {/* Score Composition */}
                <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-1 mb-3">{t('report.scoreComposition')}</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <BreakdownItem icon={Sprout} label={t('report.landStability')} value={breakdown.cultivatedLand || breakdown.landStability || 0} total="220" color="text-emerald-500" />
                        <BreakdownItem icon={PieChart} label={t('report.production')} value={breakdown.cropType || breakdown.production || 0} total="140" color="text-blue-500" />
                        <BreakdownItem icon={TrendingUp} label={t('report.financials')} value={breakdown.annualIncome || breakdown.financial || 0} total="180" color="text-purple-500" />
                        <BreakdownItem icon={Shield} label={t('report.repayment')} value={breakdown.irrigationSource || breakdown.repaymentHistory || 0} total="120" color="text-orange-500" />
                    </div>
                </div>

                {/* Risk Reasons */}
                {riskReasons && riskReasons.length > 0 && (
                    <Card title={t('report.riskFactors')}>
                        <div className="space-y-2">
                            {riskReasons.map((reason, i) => (
                                <div key={i} className="flex gap-3 p-3 bg-red-50 rounded-xl border border-red-100/50">
                                    <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-slate-700 leading-snug">{reason}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Loan Eligibility */}
                {loanEligibility && (
                    <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('report.estimatedEligibility')}</p>
                                <h3 className="text-3xl font-bold flex items-center">
                                    <span className="text-emerald-400 mr-1">₹</span>
                                    {(loanEligibility.maxAmount || loanEligibility.maxEligibleAmount)?.toLocaleString()}
                                </h3>
                            </div>
                            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
                                <IndianRupee size={24} className="text-emerald-400" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
                            <div>
                                <p className="text-slate-400 text-xs">{t('loanForm.interestRate')}</p>
                                <p className="font-semibold text-lg">{loanEligibility.interestRate}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-xs">{t('loanForm.tenure')}</p>
                                <p className="font-semibold text-lg text-emerald-300">{loanEligibility.tenure}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommendations */}
                <Card title={t('report.recommendations')}>
                    <div className="space-y-3">
                        {(recommendations || tips)?.length > 0 ? (recommendations || tips).map((tip, i) => (
                            <div key={i} className={`flex gap-3 p-3 rounded-xl border ${tip.startsWith('🔴') ? 'bg-red-50 border-red-100/50' :
                                tip.startsWith('🟡') ? 'bg-yellow-50 border-yellow-100/50' :
                                    tip.startsWith('✅') ? 'bg-emerald-50 border-emerald-100/50' :
                                        'bg-orange-50 border-orange-100/50'
                                }`}>
                                {!tip.startsWith('🔴') && !tip.startsWith('🟡') && !tip.startsWith('✅') && (
                                    <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                                )}
                                <p className="text-sm text-slate-700 leading-snug">{tip}</p>
                            </div>
                        )) : (
                            <div className="flex gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-700">{t('report.excellentProfile')}</p>
                            </div>
                        )}
                    </div>
                </Card>

            </main>
        </div>
    );
};

const BreakdownItem = ({ icon: Icon, label, value, total, color }) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-24">
        <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase">{label}</span>
            <Icon size={18} className={color} />
        </div>
        <div>
            <span className="text-2xl font-bold text-slate-800">{Math.round((value || 0) * 10)}</span>
            <span className="text-xs text-slate-300 ml-1">/{total}</span>
        </div>
    </div>
);

export default ScoreReport;
