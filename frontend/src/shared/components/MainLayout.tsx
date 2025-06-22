import React from 'react';
import { useLocation } from 'react-router-dom';
import HomeButton from './HomeButton';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const showButton = location.pathname !== '/' && location.pathname !== '/chat';

  return (
    <>
      {showButton && <HomeButton />}
      <main>{children}</main>
    </>
  );
};

export default MainLayout; 