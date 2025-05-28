import { Router } from 'express';
import { createPayment, getPayment } from '../services/yookassa.service';
import { createPayment as createPaymentRecord, updatePaymentStatus, getPaymentByYooKassaId } from '../models/Payment';
import { createSubscription, updateSubscriptionStatus } from '../models/Subscription';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Create a new subscription payment
router.post('/create', authMiddleware, async (req, res) => {
    try {
        const { amount, currency } = req.body;
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const returnUrl = `${process.env.FRONTEND_URL}/payment/success`;

        // Create subscription record
        const subscription = await createSubscription({
            userId,
            status: 'active',
            planType: 'monthly',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        });

        // Create payment in YooKassa
        const yookassaPayment = await createPayment({
            amount,
            currency,
            userId,
            subscriptionId: subscription.id!,
            returnUrl
        });

        // Create payment record in our database
        await createPaymentRecord({
            userId,
            subscriptionId: subscription.id!,
            yookassaPaymentId: yookassaPayment.id,
            amount,
            currency,
            status: 'pending'
        });

        res.json({ redirectUrl: yookassaPayment.confirmation.confirmation_url });
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Get payment status
router.get('/status/:paymentId', authMiddleware, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const payment = await getPaymentByYooKassaId(paymentId);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // If payment is still pending, check with YooKassa
        if (payment.status === 'pending') {
            const yookassaPayment = await getPayment(paymentId);
            if (yookassaPayment.status === 'succeeded') {
                await updatePaymentStatus(payment.id!, 'succeeded');
                await updateSubscriptionStatus(payment.subscriptionId, 'active');
                return res.json({ status: 'succeeded' });
            }
        }

        res.json({ status: payment.status });
    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({ error: 'Failed to check payment status' });
    }
});

export default router; 