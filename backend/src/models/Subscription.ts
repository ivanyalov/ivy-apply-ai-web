import { pool } from '../config/database';

export interface Subscription {
    id?: string;
    userId: string;
    status: 'active' | 'cancelled' | 'expired';
    planType: 'trial' | 'monthly' | 'yearly';
    startDate: Date;
    endDate: Date;
    yookassaSubscriptionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const createSubscription = async (subscription: Subscription): Promise<Subscription> => {
    const { userId, status, planType, startDate, endDate, yookassaSubscriptionId } = subscription;
    const result = await pool.query(
        `INSERT INTO subscriptions 
        (user_id, status, plan_type, start_date, end_date, yookassa_subscription_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
            id,
            user_id as "userId",
            status,
            plan_type as "planType",
            start_date as "startDate",
            end_date as "endDate",
            yookassa_subscription_id as "yookassaSubscriptionId",
            created_at as "createdAt",
            updated_at as "updatedAt"`,
        [userId, status, planType, startDate, endDate, yookassaSubscriptionId]
    );
    return result.rows[0];
};

export const getSubscriptionByUserId = async (userId: string): Promise<Subscription | null> => {
    const result = await pool.query(
        `SELECT 
            id,
            user_id as "userId",
            status,
            plan_type as "planType",
            start_date as "startDate",
            end_date as "endDate",
            yookassa_subscription_id as "yookassaSubscriptionId",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM subscriptions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 1`,
        [userId]
    );
    return result.rows[0] || null;
};

export const updateSubscriptionStatus = async (
    subscriptionId: string,
    status: Subscription['status']
): Promise<Subscription> => {
    const result = await pool.query(
        `UPDATE subscriptions 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING 
            id,
            user_id as "userId",
            status,
            plan_type as "planType",
            start_date as "startDate",
            end_date as "endDate",
            yookassa_subscription_id as "yookassaSubscriptionId",
            created_at as "createdAt",
            updated_at as "updatedAt"`,
        [status, subscriptionId]
    );
    return result.rows[0];
}; 