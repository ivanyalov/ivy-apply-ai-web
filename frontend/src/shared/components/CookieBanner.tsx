import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const COOKIE_KEY = 'cookie-consent';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) setVisible(true);
  }, []);

  const handleChoice = (choice: 'accepted' | 'declined') => {
    localStorage.setItem(COOKIE_KEY, choice);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #e5e7eb',
      boxShadow: '0 -2px 8px rgba(0,0,0,0.04)',
      zIndex: 1000,
      padding: '16px 0'
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        padding: '0 16px'
      }}>
        <div style={{ textAlign: 'center', color: '#222', fontSize: 16 }}>
          Мы используем файлы cookie для корректной работы сайта.{' '}
          <a
            href="/user-agreement"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#b91c1c', textDecoration: 'underline' }}
          >
            Подробнее — в Пользовательском соглашении
          </a>
          .
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => handleChoice('declined')}
            style={{
              background: '#f3f4f6',
              color: '#222',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 15,
              cursor: 'pointer'
            }}
          >
            Отклонить
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            style={{
              background: '#b91c1c',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 20px',
              fontSize: 15,
              cursor: 'pointer'
            }}
          >
            Принять
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;