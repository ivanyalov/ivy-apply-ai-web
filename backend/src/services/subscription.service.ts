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
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 дней для пробного периода
        });
    }

    async getSubscriptionStatus(userId: string) {
        const subscription = await getSubscriptionByUserId(userId);
        
        if (!subscription || subscription.status === 'unsubscribed' || subscription.status === 'cancelled') {
            return { hasAccess: false, type: subscription?.planType || null, status: subscription?.status || 'unsubscribed', expiresAt: subscription?.expiresAt || null };
        }

        const now = new Date();
        if (subscription.expiresAt && subscription.expiresAt <= now) {
            // Subscription has expired, update status
            if(subscription.id) {
                await updateSubscription(subscription.id, { status: 'unsubscribed' });
            }
            return { hasAccess: false, type: subscription.planType, status: 'unsubscribed', expiresAt: subscription.expiresAt };
        }
        
        const hasAccess = subscription.status === 'active';

        return {
            hasAccess,
            type: subscription.planType,
            status: subscription.status,
            expiresAt: subscription.expiresAt
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