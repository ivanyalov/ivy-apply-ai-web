import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-white border border-gray-300 rounded-lg font-semibold px-6 py-2 text-lg text-gray-900 hover:bg-gray-100 transition-colors shadow-none ml-2"
      style={{ boxShadow: 'none' }}
    >
      Ivy Apply AI
    </button>
  );
};

export default HomeButton; 