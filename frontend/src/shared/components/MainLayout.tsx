import React from 'react';
import { useLocation } from 'react-router-dom';
import HomeButton from './HomeButton';
import LanguageToggle from './LanguageToggle';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showButton = location.pathname !== '/' && location.pathname !== '/chat';
  const isLandingPage = location.pathname === '/';
  const isGrayHeader = location.pathname === '/privacy-policy' || location.pathname === '/contact' || location.pathname === '/access' || location.pathname === '/public-offer';

  return (
    <>
      {showButton && (
        <header className={`${isGrayHeader ? 'bg-gray-50' : 'bg-white'} px-6 py-4`}>
          <div className="flex justify-between items-center">
            <HomeButton />
            <LanguageToggle />
          </div>
        </header>
      )}
      {isLandingPage && (
        <header className="bg-white px-6 py-4">
          <div className="flex justify-end">
            <LanguageToggle />
          </div>
        </header>
      )}
      <main>{children}</main>
    </>
  );
};

export default MainLayout; 