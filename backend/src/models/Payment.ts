import { pool } from '../config/database';

/**
 * @interface Payment
 * @description Представляет платеж в системе.
 * @property {string} id - Уникальный идентификатор платежа.
 * @property {string} userId - Идентификатор пользователя, совершившего платеж.
 * @property {string} [subscriptionId] - Идентификатор связанной подписки.
 * @property {string} [cloudPaymentsInvoiceId] - ID счета в системе CloudPayments.
 * @property {string} [cloudPaymentsSubscriptionId] - ID подписки в системе CloudPayments.
 * @property {number} amount - Сумма платежа.
 * @property {string} currency - Валюта платежа.
 * @property {'pending' | 'succeeded' | 'canceled' | 'failed'} status - Статус платежа.
 * @property {Date} [createdAt] - Дата создания платежа.
 * @property {Date} [updatedAt] - Дата последнего обновления.
 */
export interface Payment {
    id?: string;
    userId: string;
    subscriptionId?: string;
    cloudPaymentsInvoiceId?: string;
    cloudPaymentsSubscriptionId?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'canceled' | 'failed';
    createdAt?: Date;
    updatedAt?: Date;
}

export const createPayment = async (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> => {
    const {
        userId,
        subscriptionId,
        cloudPaymentsInvoiceId,
        cloudPaymentsSubscriptionId,
        amount,
        currency,
        status
    } = payment;

    const result = await pool.query(
        `INSERT INTO payments 
        (user_id, subscription_id, cloudpayments_invoice_id, cloudpayments_subscription_id, amount, currency, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING 
            id,
            user_id as "userId",
            subscription_id as "subscriptionId",
            cloudpayments_invoice_id as "cloudPaymentsInvoiceId",
            cloudpayments_subscription_id as "cloudPaymentsSubscriptionId",
            amount,
            currency,
            status,
            created_at as "createdAt",
            updated_at as "updatedAt"`,
        [userId, subscriptionId, cloudPaymentsInvoiceId, cloudPaymentsSubscriptionId, amount, currency, status]
    );
    return result.rows[0];
};

/**
 * @function getPaymentByCloudPaymentsInvoiceId
 * @description Находит платеж в базе данных по ID счета CloudPayments.
 * @param {string} cloudPaymentsInvoiceId - ID счета в CloudPayments.
 * @returns {Promise<Payment | null>} - Объект платежа или null, если не найден.
 */
export const getPaymentByCloudPaymentsInvoiceId = async (cloudPaymentsInvoiceId: string): Promise<Payment | null> => {
    const result = await pool.query(
        `SELECT 
            id,
            user_id as "userId",
            subscription_id as "subscriptionId",
            cloudpayments_invoice_id as "cloudPaymentsInvoiceId",
            cloudpayments_subscription_id as "cloudPaymentsSubscriptionId",
            amount,
            currency,
            status,
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM payments 
        WHERE cloudpayments_invoice_id = $1`,
        [cloudPaymentsInvoiceId]
    );
    return result.rows[0] || null;
};

/**
 * @function updatePaymentStatus
 * @description Обновляет статус платежа в базе данных.
 * @param {string} paymentId - ID платежа (первичный ключ в таблице).
 * @param {Payment['status']} status - Новый статус платежа.
 * @returns {Promise<Payment>} - Обновленный объект платежа.
 */
export const updatePaymentStatus = async (
    paymentId: string,
    status: Payment['status']
): Promise<Payment> => {
    const result = await pool.query(
        `UPDATE payments 
        SET status = $1, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING 
            id,
            user_id as "userId",
            subscription_id as "subscriptionId",
            cloudpayments_invoice_id as "cloudPaymentsInvoiceId",
            cloudpayments_subscription_id as "cloudPaymentsSubscriptionId",
            amount,
            currency,
            status,
            created_at as "createdAt",
            updated_at as "updatedAt"`,
        [status, paymentId]
    );
    return result.rows[0];
};

/**
 * @function getPaymentsByUserId
 * @description Получает все платежи пользователя.
 * @param {string} userId - Идентификатор пользователя.
 * @returns {Promise<Payment[]>} - Массив платежей пользователя.
 */
export const getPaymentsByUserId = async (userId: string): Promise<Payment[]> => {
    const result = await pool.query(
        `SELECT 
            id,
            user_id as "userId",
            subscription_id as "subscriptionId",
            cloudpayments_invoice_id as "cloudPaymentsInvoiceId",
            cloudpayments_subscription_id as "cloudPaymentsSubscriptionId",
            amount,
            currency,
            status,
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM payments 
        WHERE user_id = $1 
        ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
}; 