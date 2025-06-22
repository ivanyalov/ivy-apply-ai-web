import { pool } from '../config/database';

/**
 * @interface Payment
 * @description Представляет платеж в системе.
 * @property {number} id - Уникальный идентификатор платежа.
 * @property {string} userId - Идентификатор пользователя, совершившего платеж.
 * @property {number} subscriptionId - Идентификатор связанной подписки.
 * @property {string} cloudPaymentsInvoiceId - ID счета в системе CloudPayments.
 * @property {number} amount - Сумма платежа.
 * @property {string} currency - Валюта платежа.
 * @property {'pending' | 'succeeded' | 'canceled' | 'failed'} status - Статус платежа.
 * @property {string} [paymentMethodId] - Идентификатор метода оплаты.
 * @property {Record<string, any>} [metadata] - Дополнительные данные.
 */
export interface Payment {
    id?: number;
    userId: string;
    subscriptionId: number;
    cloudPaymentsInvoiceId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'canceled' | 'failed';
    paymentMethodId?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

export const createPayment = async (payment: Omit<Payment, 'id'>): Promise<Payment> => {
    const {
        userId,
        subscriptionId,
        cloudPaymentsInvoiceId,
        amount,
        currency,
        status,
        paymentMethodId,
        metadata
    } = payment;

    const result = await pool.query(
        `INSERT INTO payments 
        (user_id, subscription_id, cloud_payments_invoice_id, amount, currency, status, payment_method_id, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [userId, subscriptionId, cloudPaymentsInvoiceId, amount, currency, status, paymentMethodId, metadata]
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
        'SELECT * FROM payments WHERE cloud_payments_invoice_id = $1',
        [cloudPaymentsInvoiceId]
    );
    return result.rows[0] || null;
};

/**
 * @function updatePaymentStatus
 * @description Обновляет статус платежа в базе данных.
 * @param {string} paymentId - ID платежа (первичный ключ в таблице).
 * @param {Payment['status']} status - Новый статус платежа.
 * @param {string} [paymentMethodId] - (Опционально) ID метода оплаты.
 * @returns {Promise<Payment>} - Обновленный объект платежа.
 */
export const updatePaymentStatus = async (
    paymentId: string,
    status: Payment['status'],
    paymentMethodId?: string
): Promise<Payment> => {
    const result = await pool.query(
        `UPDATE payments 
        SET status = $1, 
            payment_method_id = COALESCE($2, payment_method_id),
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $3 
        RETURNING *`,
        [status, paymentMethodId, paymentId]
    );
    return result.rows[0];
}; 