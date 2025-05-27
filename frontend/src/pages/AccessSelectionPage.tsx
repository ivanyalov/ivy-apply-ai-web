
import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStartTrial = async () => {
    try {
      // TODO: Replace with actual backend URL
      const response = await fetch('/api/start-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        navigate('/chat');
      } else {
        console.error('Failed to start trial');
      }
    } catch (error) {
      console.error('Error starting trial:', error);
    }
  };

  const handleSubscribe = async () => {
    try {
      // TODO: Replace with actual backend URL
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // TODO: Redirect to YooKassa checkout
        window.location.href = data.checkoutUrl || '/chat';
      } else {
        console.error('Failed to initiate subscription');
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Access Plan</h2>
          <p className="text-lg text-gray-600">Select the option that works best for you</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Free Trial Option */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Free Trial</h3>
              <p className="text-gray-600 mb-6">Get started with limited access to explore our AI assistant</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-gray-900">Free</span>
                <span className="text-gray-600 ml-2">for 7 days</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Limited chat sessions
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Basic document upload
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Essential admissions guidance
                </li>
              </ul>
              <button
                onClick={handleStartTrial}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>

          {/* Subscription Option */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-harvard-crimson relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-harvard-crimson text-white px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </span>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Full Access</h3>
              <p className="text-gray-600 mb-6">Unlimited access to all features and premium support</p>
              <div className="mb-8">
                <span className="text-4xl font-bold text-harvard-crimson">990₽</span>
                <span className="text-gray-600 ml-2">per month</span>
              </div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited chat sessions
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced file upload & analysis
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  GPT-style conversation interface
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
              </ul>
              <button
                onClick={handleSubscribe}
                className="w-full bg-harvard-crimson text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-800 transition-colors"
              >
                Subscribe Now
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Unlimited access, upload files, GPT-style chat interface.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessSelectionPage;
