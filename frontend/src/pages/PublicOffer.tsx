import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../shared/hooks/useTranslation';
import { useLanguage } from '../shared/hooks/useLanguage';
import { useAuth } from '../shared/hooks/useAuth';
import { useSubscription } from '../shared/hooks/useSubscription';

const PublicOffer: React.FC = () => {
  const [offer, setOffer] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language, toggleLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { subscription } = useSubscription();
  
  useEffect(() => {
    fetch('/legal/Offer.md')
      .then(res => res.text())
      .then(setOffer);
  }, []);

  const handleStart = () => {
    if (isAuthenticated && subscription?.hasAccess) {
      navigate('/chat');
    } else if (isAuthenticated && !subscription?.hasAccess) {
      navigate('/access');
    } else {
      navigate('/login');
    }
  };

  const handleSubscription = () => {
    navigate('/access');
  };

  return (
    <div className="min-h-screen bg-notion-gray-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50">
        <div className="w-full px-6 py-4 flex justify-between items-center">
          {/* Home Icon */}
          <button
            onClick={() => navigate('/')}
            className="text-notion-gray-700 hover:text-notion-gray-600 transition-colors"
            aria-label="Go to home page"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1.5 text-sm text-notion-gray-600 hover:text-notion-gray-700 hover:bg-notion-gray-50 rounded-md transition-colors"
            >
              {language === 'ru' ? 'EN' : 'RU'}
            </button>
            <button
              onClick={handleSubscription}
              className="px-4 py-1.5 text-sm font-medium text-notion-gray-700 bg-white border border-notion-gray-300 hover:bg-notion-gray-50 rounded-md transition-colors"
            >
              {t.landing.hero.subscriptionButton}
            </button>
            <button
              onClick={handleStart}
              className="px-4 py-1.5 text-sm font-medium text-white bg-notion-gray-700 hover:bg-notion-gray-600 rounded-md transition-colors"
            >
              {isAuthenticated ? t.landing.hero.startButton : t.landing.hero.startButton}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Clean Header */}
          <div className="bg-notion-gray-700 px-8 py-8 border-b border-gray-100">
            <h1 className="text-3xl md:text-4xl font-medium text-white mb-2 font-dm-sans">{t.legal.publicOffer.title}</h1>
            <p className="text-white/80 text-sm font-medium">
              {t.legal.publicOffer.subtitle}
            </p>
          </div>

          {/* Clean Content */}
          <div className="p-8 bg-white">
            <div className="prose prose-lg max-w-none">
              <div className="markdown-content text-notion-gray-700 leading-relaxed">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-notion-gray-700 mb-6 pb-2 border-b border-gray-200">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-notion-gray-700 mb-4 mt-8">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold text-notion-gray-700 mb-3 mt-6">{children}</h3>,
                    p: ({children}) => <p className="mb-4 text-notion-gray-600 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="mb-4 space-y-2 list-decimal list-inside">{children}</ol>,
                    li: ({children}) => <li className="text-notion-gray-600 ml-4">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-notion-gray-700">{children}</strong>,
                    em: ({children}) => <em className="italic text-notion-gray-600">{children}</em>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-notion-gray-300 pl-4 py-2 bg-notion-gray-50 rounded-r-lg mb-4">{children}</blockquote>,
                    table: ({children}) => <table className="w-full border-collapse border border-gray-200 mb-4 bg-white rounded-lg overflow-hidden">{children}</table>,
                    th: ({children}) => <th className="border border-gray-200 px-4 py-2 bg-notion-gray-50 font-semibold text-left">{children}</th>,
                    td: ({children}) => <td className="border border-gray-200 px-4 py-2">{children}</td>
                  }}
                >
                  {offer}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicOffer;
