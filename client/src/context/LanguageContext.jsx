import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Load from local storage or default to 'en'
    const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'en');

    useEffect(() => {
        localStorage.setItem('appLanguage', language);
    }, [language]);

    // Helper to get nested values, e.g., t('home.greeting.morning')
    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];

        for (let k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }
        return value;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
