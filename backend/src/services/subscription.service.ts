import { createSubscription, getSubscriptionByUserId, updateSubscription } from '../models/Subscription';
import { AuthService } from './authService';

export class SubscriptionService {
    async startTrial(userId: string) {
        const existingSubscription = await getSubscriptionByUserId(userId);
        if (existingSubscription && existingSubscription.status === 'active') {
            throw new Error('User already has an active subscription or trial.');
        }

        return await createSubscription({
            userId,
            status: 'active',
            planType: 'trial',
            startDate: new Date(),
        });
    }

    async getSubscriptionStatus(userId: string) {
        const subscription = await getSubscriptionByUserId(userId);
        
        if (!subscription || subscription.status === 'unsubscribed' || subscription.status === 'cancelled') {
            return { hasAccess: false, type: subscription?.planType || null, status: subscription?.status || 'unsubscribed', expiresAt: subscription?.endDate || null };
        }

        const now = new Date();
        if (subscription.endDate && subscription.endDate <= now) {
            // Subscription has expired, update status
            if(subscription.id) {
                await updateSubscription(subscription.id, { status: 'unsubscribed' });
            }
            return { hasAccess: false, type: subscription.planType, status: 'unsubscribed', expiresAt: subscription.endDate };
        }
        
        const hasAccess = subscription.status === 'active';

        return {
            hasAccess,
            type: subscription.planType,
            status: subscription.status,
            expiresAt: subscription.endDate
        };
    }

    async signupAndStartTrial(email: string, password: string) {
        const authService = new AuthService();
        const { user } = await authService.signup(email, password);
        const subscription = await this.startTrial(user.id);
        return { user, subscription };
    }
}

export const subscriptionService = new SubscriptionService(); 