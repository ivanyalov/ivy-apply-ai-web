import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { subscriptionService } from '../services/subscription.service';

const router = Router();

// Start trial
router.post('/start-trial', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const subscription = await subscriptionService.startTrial(userId);
        res.json({ 
            message: 'Trial started successfully',
            expiresAt: subscription.endDate
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'User already has an active subscription') {
                res.status(400).json({ error: error.message });
                return;
            }
        }
        console.error('Error starting trial:', error);
        res.status(500).json({ error: 'Failed to start trial' });
    }
});

// Get subscription status
router.get('/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }

        const status = await subscriptionService.getSubscriptionStatus(userId);
        res.json(status);
    } catch (error) {
        console.error('Error getting subscription status:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
});

export default router; 