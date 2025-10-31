import React, { useState, useEffect } from "react";
import { useLanguage } from "../hooks/useLanguage";
import { useNavigate } from "react-router-dom";

interface SettingsMenuProps {
  className?: string;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ className = "" }) => {
  const { language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [closeTimeout, setCloseTimeout] = useState<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Обработка кликов вне меню для мобильных устройств
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768 && isMenuOpen) {
        const target = event.target as Element;
        const settingsMenu = target.closest('[data-settings-menu]');
        if (!settingsMenu) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Очистка таймаута при размонтировании
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    };
  }, [isMenuOpen, closeTimeout]);

  const handleStart = () => {
    navigate('/chat');
    setIsMenuOpen(false);
  };

  const handleSubscription = () => {
    navigate('/access');
    setIsMenuOpen(false);
  };

  return (
    <div className={`relative ${className}`} data-settings-menu>
      <div
        onMouseEnter={() => {
          // На десктопе - открыть при наведении на всю область
          if (window.innerWidth >= 768) {
            // Отменяем закрытие, если оно было запланировано
            if (closeTimeout) {
              clearTimeout(closeTimeout);
              setCloseTimeout(null);
            }
            setIsMenuOpen(true);
          }
        }}
        onMouseLeave={() => {
          // На десктопе - закрыть при уходе курсора со всей области с задержкой
          if (window.innerWidth >= 768) {
            const timeout = setTimeout(() => {
              setIsMenuOpen(false);
            }, 200); // 200ms задержка
            setCloseTimeout(timeout);
          }
        }}
      >
        <button
          onClick={() => {
            // На мобильных устройствах - toggle при клике
            if (window.innerWidth < 768) {
              toggleMenu();
            }
          }}
          className="p-2 hover:bg-red-50 rounded-full transition-colors"
        >
          <svg 
            className={`w-6 h-6 text-red-600 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </button>

        {/* Dropdown Menu */}
        <div 
          className={`absolute top-12 right-0 bg-white rounded-lg shadow-[0px_2px_2px_hsla(0,0%,0%,0.07),0px_4px_4px_hsla(0,0%,0%,0.15)] border border-gray-300 py-2 min-w-48 z-[9999] transition-opacity duration-200 ${
            isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
        >
          {/* Language Switch */}
          <div className="px-4 py-3">
            <div className="relative flex items-center bg-gray-100 rounded-lg p-1">
              {/* Sliding background */}
              <div 
                className={`absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-harvard-crimson to-red-600 rounded-md transition-transform duration-300 ease-in-out ${
                  language === 'ru' ? 'translate-x-0' : 'translate-x-full'
                }`}
              ></div>
              
              {/* Language buttons */}
              <button
                onClick={() => {
                  if (language !== 'ru') toggleLanguage();
                }}
                className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors duration-300 ${
                  language === 'ru' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => {
                  if (language !== 'en') toggleLanguage();
                }}
                className={`relative z-10 w-1/2 py-2 text-sm font-medium transition-colors duration-300 ${
                  language === 'en' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                EN
              </button>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-200 my-1"></div>
          
          {/* Navigation Buttons */}
          <button
            onClick={handleStart}
            className="w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            {language === 'ru' ? 'Начать Чат' : 'Start Chat'}
          </button>
          <button
            onClick={handleSubscription}
            className="w-full px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors text-left"
          >
            {language === 'ru' ? 'Подписка' : 'Subscription'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu;
