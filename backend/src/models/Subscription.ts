import { pool } from '../config/database';

/**
 * @interface Subscription
 * @description Представляет подписку пользователя в системе.
 * @property {string} id - Уникальный идентификатор подписки.
 * @property {string} userId - Идентификатор пользователя.
 * @property {'active' | 'cancelled' | 'unsubscribed'} status - Статус подписки.
 * @property {'trial' | 'premium'} planType - Тип плана подписки.
 * @property {Date} startDate - Дата начала подписки.
 * @property {Date} endDate - Дата окончания подписки.
 * @property {string} [yookassaSubscriptionId] - Идентификатор подписки в YooKassa (если применимо).
 */
export interface Subscription {
    id?: string;
    userId: string;
    status: 'active' | 'cancelled' | 'unsubscribed';
    planType: 'trial' | 'premium';
    startDate: Date;
    endDate: Date | null;
    yookassaSubscriptionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * @function createSubscription
 * @description Создает новую запись о подписке в базе данных.
 * @param {Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'yookassaSubscriptionId' | 'endDate'>} subscription - Объект подписки.
 * @returns {Promise<Subscription>} - Созданная подписка.
 */
export const createSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt' | 'yookassaSubscriptionId' | 'endDate'>): Promise<Subscription> => {
    const { userId, status, planType, startDate } = subscription;
    const endDate = planType === 'trial' ? new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) : null;

    const result = await pool.query(
        `INSERT INTO subscriptions (user_id, status, plan_type, start_date, end_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id as "userId", status, plan_type as "planType", start_date as "startDate", end_date as "endDate", created_at as "createdAt", updated_at as "updatedAt"`,
        [userId, status, planType, startDate, endDate]
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
        `SELECT id, user_id as "userId", status, plan_type as "planType", start_date as "startDate", end_date as "endDate"
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
 * @description Обновляет план и/или статус подписки.
 * @param {string} subscriptionId - Идентификатор подписки.
 * @param {object} updates - Поля для обновления.
 */
export const updateSubscription = async (subscriptionId: string, { planType, status }: { planType?: 'premium', status?: 'cancelled' | 'unsubscribed' }) => {
    if (planType === 'premium') {
        const newEndDate = new Date();
        newEndDate.setDate(newEndDate.getDate() + 30);
        await pool.query(
            `UPDATE subscriptions SET plan_type = $1, status = 'active', end_date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
            [planType, newEndDate, subscriptionId]
        );
    } else if (status) {
        await pool.query(
          `UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [status, subscriptionId]
        );
    }
};