import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import { useSubscription } from '../shared/context/SubscriptionContext';

declare global {
  interface Window {
    cp: any;
  }
}

const AccessSelectionPage: React.FC = () => {
  const { user } = useAuth();
  const { subscription, isLoading, cancelSubscription, refreshSubscription, startTrial } = useSubscription();
  const navigate = useNavigate();

  const handlePayment = (amount: number, description: string) => {
    if (!user) {
      alert("Пожалуйста, войдите в систему, чтобы совершить платеж.");
      return;
    }
    const widget = new window.cp.CloudPayments();
    widget.pay('charge',
      {
        publicId: import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_ID,
        description: description,
        amount: amount,
        currency: 'RUB',
        accountId: user.id,
        skin: "modern",
      },
      {
        onSuccess: function () {
          alert("Оплата прошла успешно!");
          refreshSubscription();
        },
        onFail: function (reason: any) {
          alert(`Оплата не удалась: ${reason}`);
        },
      }
    )
  };

  const handleStartTrial = async () => {
    try {
      await startTrial();
      alert("Пробный период успешно активирован!");
    } catch (error) {
      console.error(error);
      alert("Не удалось начать пробный период. Возможно, у вас уже есть активная подписка.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
  }

  const renderSubscriptionInfo = () => {
    if (!subscription) {
      return null;
    }
    
    const isCancelled = subscription.status === 'cancelled' || subscription.status === 'unsubscribed';
    const expiryDate = subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('ru-RU') : 'N/A';

    return (
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Ваш Текущий План</h2>
        <p className="mb-2"><strong>План:</strong> <span className="capitalize">{subscription.type === 'trial' ? 'Пробный' : 'Премиум'}</span></p>
        <p className="mb-2"><strong>Статус:</strong> <span className="capitalize">{subscription.status === 'active' ? 'Активен' : 'Неактивен'}</span></p>
        <p className="mb-4"><strong>Истекает:</strong> {expiryDate}</p>
        
        {subscription.status === 'active' && (
           <button 
             onClick={cancelSubscription} 
             className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
           >
             Отменить Подписку
           </button>
        )}
         {isCancelled && <p className="text-red-500 font-semibold mt-4">Ваша подписка неактивна. Пожалуйста, оформите новый план для продолжения.</p>}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Выберите План Доступа</h1>
        <div className="mb-8">{renderSubscriptionInfo()}</div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border p-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-semibold mb-4">Премиум План</h2>
            <p className="text-4xl font-bold mb-4">990 RUB <span className="text-lg font-normal">/ месяц</span></p>
            <ul className="mb-6 space-y-2 text-gray-600">
              <li>✓ Неограниченный доступ к AI-чату</li>
              <li>✓ Приоритетная поддержка</li>
              <li>✓ Доступ ко всем новым функциям</li>
            </ul>
            <button onClick={() => handlePayment(990, 'Премиум План - 1 месяц')} className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
              Купить Премиум
            </button>
          </div>
          <div className="border p-6 rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-semibold mb-4">Пробный План</h2>
            <p className="text-4xl font-bold mb-4">Бесплатно <span className="text-lg font-normal">/ 7 дней</span></p>
            <ul className="mb-6 space-y-2 text-gray-600">
              <li>✓ Полный доступ к AI-чату</li>
              <li>✓ Попробуйте все функции</li>
            </ul>
            <button onClick={handleStartTrial} disabled={subscription?.status === 'active'} className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              Начать пробный период
            </button>
          </div>
        </div>

        {subscription?.hasAccess && (
          <div className="text-center mt-8">
            <button onClick={() => navigate('/chat')} className="text-blue-500 hover:underline">
              Перейти в чат
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessSelectionPage;
