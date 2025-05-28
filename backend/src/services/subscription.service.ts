import { createSubscription, getSubscriptionByUserId, updateSubscriptionStatus } from '../models/Subscription';

export class SubscriptionService {
    async startTrial(userId: string) {
        // Check if user already has an active subscription
        const existingSubscription = await getSubscriptionByUserId(userId);
        if (existingSubscription && existingSubscription.status === 'active') {
            throw new Error('User already has an active subscription');
        }

        // Create trial subscription
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        return await createSubscription({
            userId,
            status: 'active',
            planType: 'trial',
            startDate,
            endDate
        });
    }

    async getSubscriptionStatus(userId: string) {
        const subscription = await getSubscriptionByUserId(userId);
        
        if (!subscription) {
            return { hasAccess: false, type: null, expiresAt: null };
        }

        const now = new Date();
        const isActive = subscription.status === 'active' && subscription.endDate > now;

        // If subscription has expired, update its status
        if (subscription.status === 'active' && subscription.endDate <= now) {
            await updateSubscriptionStatus(subscription.id!, 'expired');
            return { hasAccess: false, type: subscription.planType, expiresAt: subscription.endDate };
        }

        return {
            hasAccess: isActive,
            type: subscription.planType,
            expiresAt: subscription.endDate
        };
    }
}

export const subscriptionService = new SubscriptionService(); 