import React from 'react';
import { useLanguage } from '../hooks/useLanguage';

interface LanguageToggleProps {
  className?: string;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className = '' }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className={`flex items-center ${className}`}>
      <div className="relative bg-white border-2 border-gray-200 rounded-xl p-1 shadow-md">
        <div 
          className={`absolute top-1 bottom-1 w-12 bg-harvard-crimson rounded-lg shadow-md transition-transform duration-300 ease-out ${
            language === 'en' ? 'transform translate-x-12' : 'transform translate-x-0'
          }`}
        />
        <div className="relative flex">
          <button
            onClick={() => language !== 'ru' && toggleLanguage()}
            className={`relative z-10 w-12 h-8 text-xs font-semibold rounded-lg transition-colors duration-300 ${
              language === 'ru' 
                ? 'text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Switch to Russian"
          >
            RU
          </button>
          <button
            onClick={() => language !== 'en' && toggleLanguage()}
            className={`relative z-10 w-12 h-8 text-xs font-semibold rounded-lg transition-colors duration-300 ${
              language === 'en' 
                ? 'text-white' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            aria-label="Switch to English"
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageToggle;
