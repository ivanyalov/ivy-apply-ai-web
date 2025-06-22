// @ts-nocheck
import { Router } from 'express';
import { getSubscriptionByUserId, updateSubscription } from '../models/Subscription';
import { createPayment } from '../models/Payment';

const router = Router();

// CloudPayments webhook (Pay notification)
router.post('/cloudpayments/notify', async (req, res) => {
  try {
    const { InvoiceId, AccountId, Amount, Currency, Status } = req.body;
    // Здесь можно добавить проверку подписи уведомления для безопасности

    if (Status === 'Completed') {
      const userId = String(AccountId);
      const subscription = await getSubscriptionByUserId(userId);

      if (subscription && subscription.id) {
        // Upgrade subscription to premium
        await updateSubscription(subscription.id, { planType: 'premium' });

        // Create a record of the successful payment
        await createPayment({
          userId,
          subscriptionId: subscription.id,
          cloudPaymentsInvoiceId: String(InvoiceId),
          amount: Number(Amount),
          currency: String(Currency),
          status: 'succeeded',
        });
      }
    }
    
    // CloudPayments requires a {code: 0} response to confirm receipt
    res.json({ code: 0 });
  } catch (error) {
    console.error('CloudPayments notify error:', error);
    // Return a non-zero code to indicate an error to CloudPayments
    res.status(500).json({ code: 13, message: 'Internal error' });
  }
});

// Пример тестового endpoint
router.get('/cloudpayments/test', (req, res) => {
  res.json({ message: 'CloudPayments integration is working!' });
});

export default router; 