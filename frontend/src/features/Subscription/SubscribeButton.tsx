import React from 'react';

const publicId = import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_ID;

// Для TypeScript:
declare global {
  interface Window {
    CloudPayments: any;
  }
}

const SubscribeButton: React.FC = () => {
  const handleCloudPayments = () => {
    const widget = new window.cp.CloudPayments();
    widget.pay(
      {
        publicId: publicId,
        description: 'Подписка Ivy Apply AI',
        amount: 990,
        currency: 'RUB',
        invoiceId: 'subscription-' + Date.now(),
        accountId: 'user@example.com', // замените на email пользователя, если есть
        skin: 'classic',
        data: {}
      },
      {
        onSuccess: function () { alert('Оплата прошла успешно!'); },
        onFail: function () { alert('Оплата не прошла'); },
        onComplete: function () {}
      }
    );
  };

  return (
    <button
      onClick={handleCloudPayments}
      className="bg-harvard-crimson text-white px-6 py-2 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
    >
      Оплатить подписку
    </button>
  );
};

export default SubscribeButton; 