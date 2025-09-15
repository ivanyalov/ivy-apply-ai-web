import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../shared/hooks/useTranslation';

const PublicOffer: React.FC = () => {
  const [offer, setOffer] = useState<string>('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  useEffect(() => {
    fetch('/legal/Offer.md')
      .then(res => res.text())
      .then(setOffer);
  }, []);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
          {/* Neo-Brutalism Document Header */}
          <div className="bg-gradient-to-r from-harvard-crimson to-red-600 px-8 py-6 border-b-2 border-white">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📄</span>
              <h1 className="text-2xl font-bold text-white">{t.legal.publicOffer.title}</h1>
            </div>
            <p className="text-red-100 mt-2">
              {t.legal.publicOffer.subtitle}
            </p>
          </div>

          {/* Neo-Brutalism Content */}
          <div className="p-8 bg-white">
            <div className="prose prose-lg max-w-none">
              <div className="markdown-content text-gray-700 leading-relaxed">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => <h1 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-gray-200">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">{children}</h3>,
                    p: ({children}) => <p className="mb-4 text-gray-700 leading-relaxed">{children}</p>,
                    ul: ({children}) => <ul className="mb-4 space-y-2">{children}</ul>,
                    ol: ({children}) => <ol className="mb-4 space-y-2 list-decimal list-inside">{children}</ol>,
                    li: ({children}) => <li className="text-gray-700 ml-4">{children}</li>,
                    strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                    em: ({children}) => <em className="italic text-gray-800">{children}</em>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-gradient-to-r from-harvard-crimson to-red-600 pl-4 py-2 bg-gray-50 rounded-r-lg mb-4 border-2 border-gray-200">{children}</blockquote>,
                    table: ({children}) => <table className="w-full border-collapse border-2 border-gray-300 mb-4 bg-white rounded-lg overflow-hidden">{children}</table>,
                    th: ({children}) => <th className="border-2 border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left">{children}</th>,
                    td: ({children}) => <td className="border-2 border-gray-300 px-4 py-2">{children}</td>
                  }}
                >
                  {offer}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Neo-Brutalism Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => navigate('/privacy-policy')}
            className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 hover:text-gradient-to-r hover:text-from-harvard-crimson hover:text-to-red-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>{t.legal.publicOffer.navigation.userAgreement}</span>
          </button>
          
          <button
            onClick={() => navigate('/contact')}
            className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-200 text-gray-700 hover:text-gradient-to-r hover:text-from-harvard-crimson hover:text-to-red-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <span>{t.legal.publicOffer.navigation.contacts}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicOffer;
