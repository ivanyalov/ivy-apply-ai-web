import React from 'react';
import { useLocation } from 'react-router-dom';
import HomeButton from './HomeButton';
import SettingsMenu from './SettingsMenu';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Hide header on landing page, chat, legal pages, access page, login, register, email verification, and registration success (they have their own navigation)
  const showButton = location.pathname !== '/' && 
                     location.pathname !== '/chat' && 
                     location.pathname !== '/privacy-policy' && 
                     location.pathname !== '/contact' && 
                     location.pathname !== '/public-offer' &&
                     location.pathname !== '/access' &&
                     location.pathname !== '/login' &&
                     location.pathname !== '/register' &&
                     location.pathname !== '/verify' &&
                     location.pathname !== '/registration-success';
  const isGrayHeader = location.pathname === '/login' ||
                      location.pathname === '/register' ||
                      location.pathname === '/verify' ||
                      location.pathname === '/registration-success';

  return (
    <>
      {showButton && (
        <header className={`${isGrayHeader ? 'bg-gray-50' : 'bg-white'} px-6 py-4`}>
          <div className="flex justify-between items-center">
            <HomeButton />
            <SettingsMenu />
          </div>
        </header>
      )}
      <main>{children}</main>
    </>
  );
};

export default MainLayout; 