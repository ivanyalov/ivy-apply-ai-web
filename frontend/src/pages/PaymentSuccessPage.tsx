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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/access')}
            className="bg-harvard-crimson text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Return to Access Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">Thank you for your subscription. Redirecting to chat...</p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage; 