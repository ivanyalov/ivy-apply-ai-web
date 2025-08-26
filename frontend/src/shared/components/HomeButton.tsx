import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <div className="flex items-center">
      <div className="bg-gray-100 rounded-xl p-1 shadow-inner">
        <button
          onClick={handleClick}
          className="w-12 h-8 text-xs font-semibold text-gray-500 hover:text-gray-700 rounded-lg transition-colors duration-300"
          aria-label="Go to home page"
        >
          IVY
        </button>
      </div>
    </div>
  );
};

export default HomeButton; 