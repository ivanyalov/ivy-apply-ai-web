import React, { useState } from "react";
import { useAuth } from "../../shared/hooks/useAuth";
import { useSubscription } from "../../shared/hooks/useSubscription";
import { useTranslation } from "../../shared/hooks/useTranslation";

const publicId = import.meta.env.VITE_CLOUDPAYMENTS_PUBLIC_ID;

// Для TypeScript:
declare global {
	interface Window {
		cp: any;
	}
}

interface CloudPaymentsResponse {
	transactionId: string;
	subscriptionId?: string;
	status: string;
	amount: number;
	currency: string;
	token?: string;
}

interface SubscribeButtonProps {
	agreedToRecurring: boolean;
}

const SubscribeButton: React.FC<SubscribeButtonProps> = ({ agreedToRecurring }) => {
	const [isLoading, setIsLoading] = useState(false);
	const { user } = useAuth();
	const { t } = useTranslation();
	const { handlePaymentSuccess } = useSubscription();

	const handleCloudPayments = () => {
		if (!user?.id) {
			alert("Пожалуйста, войдите в систему для оформления подписки");
			return;
		}

		// Проверяем доступность CloudPayments
		if (typeof window.cp === "undefined") {
			console.error("❌ CloudPayments не загружен!");
			alert("Ошибка: CloudPayments не загружен. Обновите страницу и попробуйте снова.");
			return;
		}

		// Проверяем Public ID
		if (!publicId || publicId === "test_api_00000000000000000000002") {
			console.warn("⚠️ Используется тестовый Public ID. TransactionId может не возвращаться.");
		}

		console.log("✅ CloudPayments доступен:", window.cp);
		console.log("📋 Доступные методы:", Object.keys(window.cp));
		console.log("📋 Public ID:", publicId);

		setIsLoading(true);

		try {
			// Создаем виджет CloudPayments согласно документации
			const payments = new window.cp.CloudPayments({
				yandexPaySupport: false,
				applePaySupport: false,
				googlePaySupport: false,
				masterPassSupport: false,
				tinkoffInstallmentSupport: false,
			});
			console.log("✅ Виджет CloudPayments создан:", payments);

			// Настраиваем событие oncomplete согласно документации
			payments.oncomplete = (result: any) => {
				console.log("🔄 oncomplete событие вызвано!", result);

				// Проверяем успешность платежа - используем status вместо success
				if (result && result.status === "success") {
					console.log("✅ Платеж успешен!", result);

					// Извлекаем данные для отправки на бэкэнд
					const paymentData: CloudPaymentsResponse = {
						transactionId:
							result.data?.transactionId ||
							result.transactionId ||
							result.id ||
							`transaction_${Date.now()}`,
						subscriptionId: result.subscriptionId || result.subscription?.id,
						status: "Completed",
						amount: 990,
						currency: "RUB",
						token: result.token,
					};

					console.log("💾 Готовим данные для отправки:", paymentData);

					// Отправляем данные на бэкэнд
					handlePaymentSuccessWrapper(paymentData);
				} else {
					console.log("❌ Платеж не удался", result);
					setIsLoading(false);
				}
			};

			// Создаем чек для подписки согласно документации
			const receipt = {
				Items: [
					{
						label: "Подписка Ivy Apply AI - ежемесячный доступ",
						price: 990.0,
						quantity: 1.0,
						amount: 990.0,
						vat: 20,
						method: 0,
						object: 0,
					},
				],
				taxationSystem: 0,
				email: user.email,
				phone: "",
				isBso: false,
				amounts: {
					electronic: 990.0,
					advancePayment: 0.0,
					credit: 0.0,
					provision: 0.0,
				},
			};

			// Создаем данные для ОБЫЧНОГО платежа (установочный платеж)
			const data = {
				CloudPayments: {
					CustomerReceipt: receipt,
				},
			};

			console.log("💳 Запускаем установочный платеж для подписки...");

			// Обычный платеж БЕЗ параметра recurrent
			payments
				.pay("charge", {
					publicId: publicId,
					description: "Подписка Ivy Apply AI - установочный платеж",
					amount: 990,
					currency: "RUB",
					invoiceId: "subscription-setup-" + Date.now(),
					accountId: user.id, // Добавляем для связи с пользователем
					data: data,
				})
				.then((result: any) => {
					// Виджет НЕ создает подписку, только получает токен
					console.log("✅ Первый платеж успешен, токен сохранен!", result);

					// Webhook получит Token и создаст подписку через API
					// Здесь мы получаем только transactionId
					const paymentData: CloudPaymentsResponse = {
						transactionId:
							result.data?.transactionId ||
							result.transactionId ||
							result.id ||
							`transaction_${Date.now()}`,
						status: "Completed",
						amount: 990,
						currency: "RUB",
						// subscriptionId будет создан в webhook через API
					};

					handlePaymentSuccessWrapper(paymentData);
				})
				.catch((error: any) => {
					console.error("❌ Ошибка при обработке платежа:", error);
					alert("Ошибка при обработке платежа. Попробуйте снова.");
					setIsLoading(false);
				});

			console.log("✅ Виджет CloudPayments запущен");
		} catch (error) {
			console.error("❌ Ошибка при создании виджета CloudPayments:", error);
			alert("Ошибка при запуске платежной формы. Попробуйте обновить страницу.");
			setIsLoading(false);
		}
	};

	// Обработка успешного платежа через useSubscription хук
	const handlePaymentSuccessWrapper = async (paymentData: CloudPaymentsResponse) => {
		try {
			console.log("💾 Processing payment success:", paymentData);

			// Используем хук для отправки данных на бэкэнд
			await handlePaymentSuccess({
				...paymentData,
				accountId: user?.id || "",
			});

			console.log("✅ Payment processed successfully");

			// Показываем уведомление об успешном сохранении
			alert("Подписка успешно оформлена! TransactionId сохранен в базе данных.");

			// Обновляем страницу или состояние приложения
			window.location.reload();
		} catch (error) {
			console.error("❌ Error processing payment:", error);
			alert("Ошибка при сохранении данных подписки. Обратитесь в поддержку.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			onClick={handleCloudPayments}
			className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
				agreedToRecurring && user?.email_verified && !isLoading
					? "bg-harvard-crimson text-white hover:bg-red-800"
					: "bg-gray-300 text-gray-500 cursor-not-allowed"
			}`}
		>
			{!user?.email_verified
				? t.subscription.verifyEmailButton
				: isLoading
				? t.subscription.processing
				: t.subscription.subscribeButton}
		</button>
	);
};

export default SubscribeButton;
