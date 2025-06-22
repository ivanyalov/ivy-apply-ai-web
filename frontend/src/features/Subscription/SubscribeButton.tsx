import React from 'react';

const publicId = import.meta.env.VITE_CLOUD_PAYMENTS_PUBLIC_ID;

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
    <button onClick={handleCloudPayments} style={{background:'#b91c1c',color:'#fff',padding:'12px 32px',border:'none',borderRadius:6,fontSize:18,cursor:'pointer'}}>
      Оплатить подписку
    </button>
  );
};

export default SubscribeButton; 