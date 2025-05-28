import { pool } from '../config/database';

export interface Payment {
    id?: number;
    userId: string;
    subscriptionId: number;
    yookassaPaymentId: string;
    amount: number;
    currency: string;
    status: 'pending' | 'succeeded' | 'canceled' | 'failed';
    paymentMethodId?: string;
    metadata?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
}

export const createPayment = async (payment: Payment): Promise<Payment> => {
    const {
        userId,
        subscriptionId,
        yookassaPaymentId,
        amount,
        currency,
        status,
        paymentMethodId,
        metadata
    } = payment;

    const result = await pool.query(
        `INSERT INTO payments 
        (user_id, subscription_id, yookassa_payment_id, amount, currency, status, payment_method_id, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [userId, subscriptionId, yookassaPaymentId, amount, currency, status, paymentMethodId, metadata]
    );
    return result.rows[0];
};

export const getPaymentByYooKassaId = async (yookassaPaymentId: string): Promise<Payment | null> => {
    const result = await pool.query(
        'SELECT * FROM payments WHERE yookassa_payment_id = $1',
        [yookassaPaymentId]
    );
    return result.rows[0] || null;
};

export const updatePaymentStatus = async (
    paymentId: number,
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