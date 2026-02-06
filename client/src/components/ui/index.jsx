import React from 'react';
import { Loader2 } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

// 1. Button
export const Button = ({ children, onClick, variant = 'primary', className = '', isLoading = false, type = 'button', disabled = false, icon: Icon }) => {
    const baseStyles = "w-full py-3.5 px-6 rounded-xl font-semibold transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200",
        secondary: "bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-700 hover:border-slate-200",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
        outline: "border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || isLoading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {isLoading && <Loader2 className="animate-spin" size={20} />}
            {!isLoading && Icon && <Icon size={20} />}
            {children}
        </button>
    );
};

// 2. Input - Fixed onChange to pass value instead of event
export const Input = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, required = false, className = '' }) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && <label className="text-sm font-medium text-slate-700 ml-1">{label} {required && <span className="text-red-500">*</span>}</label>}
        <div className="relative group">
            {Icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"><Icon size={18} /></div>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-white border border-slate-200 text-slate-800 rounded-xl px-4 py-3 ${Icon ? 'pl-10' : ''} outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 placeholder:text-slate-400`}
            />
        </div>
    </div>
);

// 3. Card
export const Card = ({ children, className = '', title, action }) => (
    <div className={`bg-white rounded-2xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100/50 ${className}`}>
        {(title || action) && (
            <div className="flex justify-between items-center mb-4">
                {title && <h3 className="font-bold text-lg text-slate-800">{title}</h3>}
                {action}
            </div>
        )}
        {children}
    </div>
);

// 4. PageHeader
export const PageHeader = ({ title, subtitle, backAction, action }) => (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            {backAction && (
                <button onClick={backAction} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                    {/* Assuming ArrowLeft is passed as child or icon, but for flexibility: */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
            )}
            <div>
                <h1 className="font-bold text-lg text-slate-800 leading-tight">{title}</h1>
                {subtitle && <p className="text-xs text-slate-500 font-medium">{subtitle}</p>}
            </div>
        </div>
        <div className="flex items-center gap-2">
            <LanguageSelector className="[&_select]:text-slate-700 [&_svg]:text-slate-600 [&>div]:bg-slate-100 [&>div]:border-slate-200" />
            {action}
        </div>
    </header>
);
