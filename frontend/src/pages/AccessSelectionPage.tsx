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
      setError('Произошла ошибка при запуске пробной версии');
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
      setError('Произошла ошибка при обработке вашей подписки');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Пожалуйста, войдите</h2>
          <p className="text-gray-600 mb-6">Вам необходимо войти, чтобы получить доступ к вариантам подписки.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-harvard-crimson text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Войти
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
            {subscriptionStatus.type === 'trial' ? 'Активная пробная версия' : 'Активная подписка'}
          </h2>
          <p className="text-gray-600 mb-6">
            {subscriptionStatus.type === 'trial' 
              ? `Ваша пробная версия истекает ${new Date(subscriptionStatus.expiresAt!).toLocaleDateString()}`
              : 'У вас полный доступ ко всем функциям'}
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="bg-harvard-crimson text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Перейти в чат
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Выберите ваш план доступа</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 mt-12 items-stretch">
          {/* Free Trial Option */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-gray-200 flex flex-col justify-between">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Пробная версия</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">Бесплатно</span>
                    <span className="text-gray-600 ml-2">на 7 дней</span>
                  </div>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ограниченные сессии чата
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Базовая загрузка документов
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Основные рекомендации по поступлению
                  </li>
                </ul>
              </div>
              <button
                onClick={handleStartTrial}
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Обработка...' : 'Начать пробную версию'}
              </button>
            </div>
          </div>

          {/* Subscription Option */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-harvard-crimson relative flex flex-col justify-between">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mt-2">
              <span className="bg-harvard-crimson text-white px-4 py-1 rounded-full text-sm font-medium">
                Рекомендуется
              </span>
            </div>
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Полный доступ</h3>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-harvard-crimson">990₽</span>
                    <span className="text-gray-600 ml-2">в месяц</span>
                  </div>
                </div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Неограниченные сессии чата
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Расширенная загрузка и анализ файлов
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Интерфейс чата в стиле GPT
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Приоритетная поддержка
                  </li>
                </ul>
              </div>
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-harvard-crimson text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Обработка...' : 'Подписаться сейчас'}
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          {/* Removed redundant text */}
        </div>
      </div>
    </div>
  );
};

export default AccessSelectionPage;
