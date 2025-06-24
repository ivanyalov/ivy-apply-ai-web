import { pool } from '../config/database';

/**
 * @interface Subscription
 * @description Представляет подписку пользователя в системе.
 * @property {string} id - Уникальный идентификатор подписки.
 * @property {string} userId - Идентификатор пользователя.
 * @property {'active' | 'cancelled' | 'unsubscribed'} status - Статус подписки.
 * @property {'trial' | 'premium'} planType - Тип плана подписки.
 * @property {Date} startDate - Дата начала подписки.
 * @property {Date} expiresAt - Дата истечения подписки.
 * @property {string} [cloudPaymentsSubscriptionId] - Идентификатор подписки в CloudPayments.
 * @property {string} [cloudPaymentsToken] - Токен карты для подписки.
 * @property {Date} [cancelledAt] - Дата отмены подписки.
 * @property {Date} [createdAt] - Дата создания записи.
 * @property {Date} [updatedAt] - Дата последнего обновления.
 */
export interface Subscription {
    id?: string;
    userId: string;
    status: 'active' | 'cancelled' | 'unsubscribed';
    planType: 'trial' | 'premium';
    startDate: Date;
    expiresAt: Date | null;
    cloudPaymentsSubscriptionId?: string;
    cloudPaymentsToken?: string;
    cancelledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * @function createSubscription
 * @description Создает новую запись о подписке в базе данных.
 * @param {Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>} subscription - Объект подписки.
 * @returns {Promise<Subscription>} - Созданная подписка.
 */
export const createSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> => {
    const { 
        userId, 
        status, 
        planType, 
        startDate, 
        expiresAt,
        cloudPaymentsSubscriptionId,
        cloudPaymentsToken 
    } = subscription;

    const result = await pool.query(
        `INSERT INTO subscriptions (
            user_id, 
            status, 
            plan_type, 
            start_date, 
            expires_at,
            cloudpayments_subscription_id,
            cloudpayments_token
        )
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING 
            id, 
            user_id as "userId", 
            status, 
            plan_type as "planType", 
            start_date as "startDate", 
            expires_at as "expiresAt",
            cloudpayments_subscription_id as "cloudPaymentsSubscriptionId",
            cloudpayments_token as "cloudPaymentsToken",
            created_at as "createdAt", 
            updated_at as "updatedAt"`,
        [userId, status, planType, startDate, expiresAt, cloudPaymentsSubscriptionId, cloudPaymentsToken]
    );
    return result.rows[0];
};

/**
 * @function getSubscriptionByUserId
 * @description Получает последнюю подписку пользователя по его ID.
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<Subscription | null>} - Объект подписки или null, если не найдена.
 */
export const getSubscriptionByUserId = async (userId: string): Promise<Subscription | null> => {
    const result = await pool.query(
        `SELECT 
            id, 
            user_id as "userId", 
            status, 
            plan_type as "planType", 
            start_date as "startDate", 
            expires_at as "expiresAt",
            cloudpayments_subscription_id as "cloudPaymentsSubscriptionId",
            cloudpayments_token as "cloudPaymentsToken",
            cancelled_at as "cancelledAt",
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

/**
 * @function updateSubscription
 * @description Обновляет подписку.
 * @param {string} subscriptionId - Идентификатор подписки.
 * @param {object} updates - Поля для обновления.
 */
export const updateSubscription = async (
    subscriptionId: string, 
    updates: {
        planType?: 'premium';
        status?: 'active' | 'cancelled' | 'unsubscribed';
        expiresAt?: Date;
        cloudPaymentsSubscriptionId?: string;
        cloudPaymentsToken?: string;
        cancelledAt?: Date;
    }
) => {
    const {
        planType,
        status,
        expiresAt,
        cloudPaymentsSubscriptionId,
        cloudPaymentsToken,
        cancelledAt
    } = updates;

    let query = 'UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP';
    const values: any[] = [];
    let paramIndex = 1;

    if (planType) {
        query += `, plan_type = $${paramIndex++}`;
        values.push(planType);
    }

    if (status) {
        query += `, status = $${paramIndex++}`;
        values.push(status);
    }

    if (expiresAt) {
        query += `, expires_at = $${paramIndex++}`;
        values.push(expiresAt);
    }

    if (cloudPaymentsSubscriptionId) {
        query += `, cloudpayments_subscription_id = $${paramIndex++}`;
        values.push(cloudPaymentsSubscriptionId);
    }

    if (cloudPaymentsToken) {
        query += `, cloudpayments_token = $${paramIndex++}`;
        values.push(cloudPaymentsToken);
    }

    if (cancelledAt) {
        query += `, cancelled_at = $${paramIndex++}`;
        values.push(cancelledAt);
    }

    query += ` WHERE id = $${paramIndex}`;
    values.push(subscriptionId);

    await pool.query(query, values);
};

/**
 * @function hasActiveSubscription
 * @description Проверяет, есть ли у пользователя активная подписка.
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<boolean>} - true, если есть активная подписка.
 */
export const hasActiveSubscription = async (userId: string): Promise<boolean> => {
    const subscription = await getSubscriptionByUserId(userId);
    if (!subscription) return false;
    
    return subscription.status === 'active' && 
           !!subscription.expiresAt && 
           subscription.expiresAt > new Date();
};