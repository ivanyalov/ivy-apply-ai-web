import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { authService } from '../shared/api/auth';
import { paymentService } from '../shared/api/payment';
import { subscriptionService, SubscriptionStatus } from '../shared/api/subscription';

const AccessSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (isAuthenticated) {
        try {
          const status = await subscriptionService.getStatus();
          setSubscriptionStatus(status);
        } catch (error) {
          console.error('Error checking subscription status:', error);
        }
      }
    };

    checkSubscriptionStatus();
  }, [isAuthenticated]);

  const handleStartTrial = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { message, expiresAt } = await subscriptionService.startTrial();
      setSubscriptionStatus({
        hasAccess: true,
        type: 'trial',
        expiresAt: new Date(expiresAt)
      });
      navigate('/chat');
    } catch (error) {
      console.error('Error starting trial:', error);
      setError('An error occurred while starting the trial');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { redirectUrl } = await paymentService.createPayment(990, 'RUB');
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Error starting subscription:', error);
      setError('An error occurred while processing your subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to access subscription options.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-harvard-crimson text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // If user already has an active subscription, show subscription info
  if (subscriptionStatus?.hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {subscriptionStatus.type === 'trial' ? 'Active Trial' : 'Active Subscription'}
          </h2>
          <p className="text-gray-600 mb-6">
            {subscriptionStatus.type === 'trial' 
              ? `Your trial expires on ${new Date(subscriptionStatus.expiresAt!).toLocaleDateString()}`
              : 'You have full access to all features'}
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="bg-harvard-crimson text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Access Plan</h2>
          <p className="text-lg text-gray-600">Select the option that works best for you</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

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
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Start Free Trial'}
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
                disabled={isLoading}
                className="w-full bg-harvard-crimson text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Subscribe Now'}
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
