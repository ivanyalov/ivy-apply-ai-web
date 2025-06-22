import axios from 'axios';
import { authService } from './auth';

/**
 * @class PaymentService
 * @description Сервис для взаимодействия с API платежей. (В настоящее время не используется,
 * так как логика оплаты обрабатывается через виджет CloudPayments на стороне клиента).
 */
class PaymentService {
  // Методы createPayment и getPaymentStatus удалены,
  // так как они больше не соответствуют текущей логике оплаты.
}

export const paymentService = new PaymentService(); 