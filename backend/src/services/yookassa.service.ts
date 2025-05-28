import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const YOOKASSA_API_URL = 'https://api.yookassa.ru/v3';
const SHOP_ID = process.env.YOOKASSA_SHOP_ID;
const SECRET_KEY = process.env.YOOKASSA_SECRET_KEY;

if (!SHOP_ID || !SECRET_KEY) {
    throw new Error('YooKassa credentials are not configured');
}

const yookassaApi = axios.create({
    baseURL: YOOKASSA_API_URL,
    auth: {
        username: SHOP_ID,
        password: SECRET_KEY
    }
});

export interface CreatePaymentParams {
    amount: number;
    currency: string;
    userId: string;
    subscriptionId: number;
    returnUrl: string;
}

export const createPayment = async (params: CreatePaymentParams) => {
    const { amount, currency, userId, subscriptionId, returnUrl } = params;
    const idempotenceKey = uuidv4();

    try {
        const response = await yookassaApi.post('/payments', {
            amount: {
                value: amount.toFixed(2),
                currency
            },
            confirmation: {
                type: 'redirect',
                return_url: returnUrl
            },
            capture: true,
            save_payment_method: true,
            description: `Subscription payment for user ${userId}`,
            metadata: {
                userId,
                subscriptionId
            }
        }, {
            headers: {
                'Idempotence-Key': idempotenceKey
            }
        });

        return response.data;
    } catch (error) {
        console.error('YooKassa payment creation error:', error);
        throw error;
    }
};

export const getPayment = async (paymentId: string) => {
    try {
        const response = await yookassaApi.get(`/payments/${paymentId}`);
        return response.data;
    } catch (error) {
        console.error('YooKassa get payment error:', error);
        throw error;
    }
};

export const createRecurringPayment = async (
    amount: number,
    currency: string,
    paymentMethodId: string,
    userId: string,
    subscriptionId: number
) => {
    const idempotenceKey = uuidv4();

    try {
        const response = await yookassaApi.post('/payments', {
            amount: {
                value: amount.toFixed(2),
                currency
            },
            payment_method_id: paymentMethodId,
            capture: true,
            description: `Recurring subscription payment for user ${userId}`,
            metadata: {
                userId,
                subscriptionId
            }
        }, {
            headers: {
                'Idempotence-Key': idempotenceKey
            }
        });

        return response.data;
    } catch (error) {
        console.error('YooKassa recurring payment error:', error);
        throw error;
    }
}; 