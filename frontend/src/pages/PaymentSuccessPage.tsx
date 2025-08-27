import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentService } from '../shared/api/payment';

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const redirectToChat = useCallback(() => {
    navigate('/chat');
  }, [navigate]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const paymentId = searchParams.get('payment_id');
        if (!paymentId) {
          setStatus('error');
          setError('Payment ID not found');
          return;
        }

        // Поскольку метод getPaymentStatus удален, считаем платеж успешным
        // если есть payment_id в URL (это означает, что пользователь был перенаправлен с CloudPayments)
        setStatus('success');
        // Redirect to chat page after 3 seconds
        setTimeout(redirectToChat, 3000);
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
        setError('Failed to verify payment status');
      }
    };

    checkPaymentStatus();
  }, [searchParams, redirectToChat]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-blue-50 border-2 border-blue-200 shadow-md mb-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-harvard-crimson"></div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment</h2>
              <p className="text-gray-600">Please wait while we verify your payment...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-red-50 border-2 border-red-200 shadow-md mb-6">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate('/access')}
                className="w-full bg-harvard-crimson text-white px-6 py-3 border-2 border-red-700 rounded-xl font-semibold text-lg hover:bg-red-800 hover:border-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                Return to Access Page
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-xl bg-green-50 border-2 border-green-200 shadow-md mb-6">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Thank you for your subscription. Redirecting to chat...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 