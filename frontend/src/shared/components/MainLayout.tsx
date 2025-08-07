import React from 'react';
import { useLocation } from 'react-router-dom';
import HomeButton from './HomeButton';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showButton = location.pathname !== '/' && location.pathname !== '/chat';
  const isGrayHeader = location.pathname === '/user-agreement' || location.pathname === '/contact' || location.pathname === '/access' || location.pathname === '/public-offer';

  return (
    <>
      {showButton && (
        <header className={`${isGrayHeader ? 'bg-gray-50' : 'bg-white'} px-6 py-4`}>
          <HomeButton />
        </header>
      )}
      <main>{children}</main>
    </>
  );
};

export default MainLayout; 