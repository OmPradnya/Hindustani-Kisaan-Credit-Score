import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Card } from '../components/ui';
import { Sprout, Lock, User, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { API } from '../config/api';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);

    // Simple state for demo (can use complex object if needed)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Only for register

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = isRegister ? API.AUTH.REGISTER : API.AUTH.LOGIN;
        const payload = isRegister ? { username, password, name } : { username, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (isRegister) {
                    setIsRegister(false); // Switch to login view
                    alert("Registration successful! Please login.");
                } else {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    navigate('/home');
                }
            } else {
                alert(data.message || "Authentication failed");
            }
        } catch (error) {
            console.error(error);
            alert("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Brand Section */}
            <div className="md:w-1/2 bg-emerald-600 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-800/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                {/* Language Selector for Mobile (Absolute Top Right) */}
                <div className="absolute top-6 right-6 md:left-6 md:right-auto z-20">
                    <LanguageSelector />
                </div>

                <div className="relative z-10 mt-16 md:mt-0">
                    <div className="bg-white/20 w-fit p-3 rounded-2xl mb-6 backdrop-blur-sm">
                        <Sprout size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">{t('kisaanVikas')}</h1>
                    <p className="text-emerald-100 text-lg md:text-xl font-light">{t('empoweringMsg')}</p>
                </div>

                <div className="relative z-10 hidden md:block space-y-4">
                    <Feature text={t('features.score')} />
                    <Feature text={t('features.loan')} />
                    <Feature text={t('features.paperless')} />
                </div>
            </div>

            {/* Auth Form Section */}
            <div className="md:w-1/2 flex items-center justify-center p-6">
                <div className="w-full max-w-md animate-fade-in-up">
                    <div className="text-center mb-8 md:hidden">
                        <h2 className="text-2xl font-bold text-slate-800">{isRegister ? t('register') : t('welcome')}</h2>
                        <p className="text-slate-500">{t('login')} to access your dashboard</p>
                    </div>

                    <Card className="border-none shadow-xl shadow-slate-200/50">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2 hidden md:block">{isRegister ? t('createAccount') : t('login')}</h2>
                        <p className="text-slate-500 mb-6 hidden md:block">{isRegister ? t('startJourney') : t('enterDetails')}</p>

                        <form onSubmit={handleAuth} className="space-y-5">
                            {isRegister && (
                                <Input
                                    label={t('fullName')}
                                    icon={User}
                                    placeholder="e.g. Ram Kumar"
                                    value={name}
                                    onChange={(val) => setName(val)}
                                />
                            )}

                            <Input
                                label={t('username')}
                                icon={User}
                                placeholder={t('username')}
                                value={username}
                                onChange={(val) => setUsername(val)}
                                required
                            />

                            <Input
                                label={t('password')}
                                icon={Lock}
                                type="password"
                                placeholder={t('password')}
                                value={password}
                                onChange={(val) => setPassword(val)}
                                required
                            />

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : (isRegister ? t('createAccount') : t('login'))}
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-slate-500 text-sm">
                                {isRegister ? t('alreadyHaveAccount') : t('dontHaveAccount')}
                                <button
                                    type="button"
                                    onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }}
                                    className="ml-2 font-semibold text-emerald-600 hover:text-emerald-700 transition"
                                >
                                    {isRegister ? t('login') : t('register')}
                                </button>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const Feature = ({ text }) => (
    <div className="flex items-center gap-3 text-emerald-50">
        <CheckCircle2 size={20} className="text-emerald-300" />
        <span className="font-medium">{text}</span>
    </div>
);

export default Login;
