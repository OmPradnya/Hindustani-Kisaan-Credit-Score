import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ className = '' }) => {
    const { language, setLanguage } = useLanguage();

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'hi', label: 'हिंदी' },
        { code: 'mr', label: 'मराठी' },
        { code: 'kn', label: 'ಕನ್ನಡ' }
    ];

    return (
        <div className={`relative inline-block ${className}`}>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/20">
                <Globe size={16} className="text-white ml-2" />
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer py-1 pr-2 [&>option]:text-slate-800"
                >
                    {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                            {lang.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default LanguageSelector;
