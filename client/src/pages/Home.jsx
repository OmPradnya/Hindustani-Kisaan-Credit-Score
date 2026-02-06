import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Sprout, ClipboardList, LogOut, User, ChevronRight, Activity, Sparkles, Sun, Moon, Sunrise, TrendingUp, Shield, Zap, ArrowUpRight } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { API } from '../config/api';

const Home = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [user, setUser] = useState(null);
    const [scoreData, setScoreData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        try {
            const response = await fetch(API.AUTH.PROFILE, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                if (data.user.hkcsData) {
                    setScoreData(data.user.hkcsData);
                }
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error("Failed to load user data");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return { text: t('home.greeting.morning'), icon: Sunrise, emoji: "🌅" };
        if (hour < 18) return { text: t('home.greeting.afternoon'), icon: Sun, emoji: "☀️" };
        return { text: t('home.greeting.evening'), icon: Moon, emoji: "🌙" };
    };

    const getScoreStatus = (score) => {
        // score is stored as 0-100 internally, thresholds adjusted accordingly
        if (score >= 75) return { label: t('home.excellent'), color: "text-emerald-400", bg: "bg-emerald-500/20" };
        if (score >= 50) return { label: t('home.good'), color: "text-amber-400", bg: "bg-amber-500/20" };
        return { label: t('home.building'), color: "text-orange-400", bg: "bg-orange-500/20" };
    };

    const { text: greeting, icon: GreetingIcon, emoji } = getGreeting();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/50 flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <Sprout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-600" size={24} />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-pattern pb-24 relative overflow-hidden">
            {/* Decorative Background Orbs */}
            <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-emerald-400/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tl from-teal-400/15 to-transparent rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            {/* Header */}
            <header className="glass-card sticky top-0 z-50 px-6 py-4 mx-4 mt-4 rounded-2xl shadow-lg shadow-emerald-100/50">
                <div className="flex justify-between items-center max-w-xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
                                <Sprout size={22} className="text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-white"></div>
                        </div>
                        <div>
                            <span className="font-bold text-xl bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent tracking-tight">{t('kisaanVikas')}</span>
                            <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">{t('home.smartFarming')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageSelector className="[&_select]:text-slate-700 [&_svg]:text-slate-600 [&>div]:bg-slate-100 [&>div]:border-slate-200" />
                        <button
                            onClick={handleLogout}
                            className="p-2.5 glass rounded-xl hover:bg-red-50 transition-all duration-300 text-slate-400 hover:text-red-500 hover:shadow-md group"
                        >
                            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="px-6 py-8 max-w-xl mx-auto space-y-8">

                {/* Welcome Section */}
                <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl">{emoji}</span>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{greeting}</p>
                            <h1 className="text-2xl font-bold text-slate-800">{user?.name || "Farmer"}</h1>
                        </div>
                    </div>
                </div>

                {/* Hero Score Card */}
                <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                    <div className="relative group">
                        {/* Glow Effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-gradient"></div>

                        <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 rounded-[2rem] p-8 text-white shadow-2xl overflow-hidden">
                            {/* Animated Background Patterns */}
                            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-white/10 to-transparent rounded-full -mr-20 -mt-20 animate-float"></div>
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-gradient-to-tr from-black/20 to-transparent rounded-full -ml-16 -mb-16"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_transparent_70%)]"></div>

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 animate-shimmer opacity-20"></div>

                            <div className="relative z-10">
                                {/* Header Row */}
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="glass p-2 rounded-xl">
                                            <Shield size={18} className="text-emerald-200" />
                                        </div>
                                        <div>
                                            <p className="text-emerald-100/80 text-xs font-medium uppercase tracking-wider">{t('home.hindustaniKisaan')}</p>
                                            <p className="text-white font-bold text-lg">{t('home.creditScore')}</p>
                                        </div>
                                    </div>
                                    <div className="glass p-2.5 rounded-xl animate-bounce-subtle">
                                        <Sparkles className="text-yellow-300" size={22} />
                                    </div>
                                </div>

                                {/* Score Display */}
                                <div className="flex items-end gap-6 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-black tracking-tighter">
                                                {scoreData ? Math.round(scoreData.score * 10) : "--"}
                                            </span>
                                            <span className="text-xl text-emerald-200/80 font-medium">/1000</span>
                                        </div>
                                        {scoreData && (
                                            <div className="mt-3">
                                                <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 rounded-full transition-all duration-1000 ease-out"
                                                        style={{ width: `${scoreData.score}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        {!scoreData && (
                                            <p className="text-emerald-200/70 text-sm mt-2 flex items-center gap-2">
                                                <Zap size={14} />
                                                {t('home.calculateScore')}
                                            </p>
                                        )}
                                    </div>

                                    {scoreData && (
                                        <div className={`${getScoreStatus(scoreData.score).bg} px-4 py-2 rounded-xl`}>
                                            <p className={`font-bold ${getScoreStatus(scoreData.score).color}`}>
                                                {getScoreStatus(scoreData.score).label}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Stats Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <TrendingUp size={14} className="text-emerald-300" />
                                            <p className="text-xs text-emerald-100/70 uppercase tracking-wider">{t('home.trend')}</p>
                                        </div>
                                        <p className="font-bold text-lg">
                                            {scoreData ? "+12" : "--"}
                                            <span className="text-xs text-emerald-200/60 ml-1">pts</span>
                                        </p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/15 transition-colors">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity size={14} className="text-teal-300" />
                                            <p className="text-xs text-emerald-100/70 uppercase tracking-wider">{t('home.rank')}</p>
                                        </div>
                                        <p className="font-bold text-lg">
                                            {scoreData ? "Top 25%" : "--"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center">
                                <Zap size={16} className="text-emerald-600" />
                            </div>
                            {t('home.quickActions')}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <ActionCard
                            icon={CreditCard}
                            gradient="from-blue-500 to-indigo-600"
                            bgLight="bg-gradient-to-br from-blue-50 to-indigo-50"
                            title={t('home.loanEligibility')}
                            desc={t('home.checkLimit')}
                            onClick={() => navigate('/assess/loan-eligibility')}
                        />
                        <ActionCard
                            icon={Activity}
                            gradient="from-purple-500 to-pink-600"
                            bgLight="bg-gradient-to-br from-purple-50 to-pink-50"
                            title={t('home.creditScore')}
                            desc={t('home.updateScore')}
                            onClick={() => navigate('/assess/credit-score')}
                        />
                    </div>
                </div>

                {/* Navigation Cards */}
                <div className="space-y-3 animate-fade-in-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-100 to-amber-100 rounded-lg flex items-center justify-center">
                            <User size={16} className="text-orange-600" />
                        </div>
                        {t('home.account')}
                    </h3>

                    <NavCard
                        icon={User}
                        gradient="from-orange-500 to-amber-500"
                        bgLight="bg-orange-50"
                        title={t('home.myProfile')}
                        desc={t('home.personalSettings')}
                        onClick={() => navigate('/profile')}
                    />
                    <NavCard
                        icon={ClipboardList}
                        gradient="from-indigo-500 to-violet-500"
                        bgLight="bg-indigo-50"
                        title={t('home.pastReports')}
                        desc={t('home.viewHistory')}
                        onClick={() => navigate('/report')}
                    />
                </div>

            </main>
        </div>
    );
};

const ActionCard = ({ icon: Icon, gradient, bgLight, title, desc, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`${bgLight} glass-card p-5 rounded-2xl text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] flex flex-col justify-between h-40 group relative overflow-hidden w-full`}
        >
            {/* Hover Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

            <div className={`bg-gradient-to-br ${gradient} w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={22} className="text-white" />
            </div>

            <div className="relative z-10">
                <h4 className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                    {title}
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </h4>
                <p className="text-xs text-slate-500 font-medium">{desc}</p>
            </div>
        </button>
    );
};

const NavCard = ({ icon: Icon, gradient, bgLight, title, desc, onClick }) => (
    <div
        onClick={onClick}
        className="glass-card p-4 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] group"
    >
        <div className="flex items-center gap-4">
            <div className={`${bgLight} p-3 rounded-xl group-hover:scale-105 transition-transform relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity`}></div>
                <Icon size={20} className={`bg-gradient-to-br ${gradient} bg-clip-text relative z-10`} style={{ color: 'inherit' }} />
            </div>
            <div>
                <h4 className="font-bold text-slate-800">{title}</h4>
                <p className="text-xs text-slate-500">{desc}</p>
            </div>
        </div>
        <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors">
            <ChevronRight className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" size={18} />
        </div>
    </div>
);

export default Home;
