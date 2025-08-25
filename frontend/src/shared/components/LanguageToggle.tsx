import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={toggleLanguage}
        className="flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        aria-label="Toggle language"
      >
        <span className={`px-2 py-1 rounded ${language === 'ru' ? 'bg-harvard-crimson text-white' : 'text-gray-600'} transition-colors`}>
          RU
        </span>
        <span className="mx-1 text-gray-400">|</span>
        <span className={`px-2 py-1 rounded ${language === 'en' ? 'bg-harvard-crimson text-white' : 'text-gray-600'} transition-colors`}>
          EN
        </span>
      </button>
    </div>
  );
};

export default LanguageToggle;
