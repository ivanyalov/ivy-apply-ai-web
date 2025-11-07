import React, { useState } from "react";
import { useAuth } from "../../shared/hooks/useAuth";
import { useSubscription } from "../../shared/hooks/useSubscription";
import { useTranslation } from "../../shared/hooks/useTranslation";
import { cloudPaymentsService } from "../../shared/services/cloudpayments.service";

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

	const handleCloudPayments = async () => {
		if (!user?.id) {
			alert("Пожалуйста, войдите в систему для оформления подписки");
			return;
		}

		if (!agreedToRecurring) {
			alert("Пожалуйста, согласитесь с условиями автоматического продления подписки");
			return;
		}

		// Проверяем доступность CloudPayments
		if (!cloudPaymentsService.isWidgetAvailable()) {
			console.error("❌ CloudPayments не загружен!");
			alert("Ошибка: CloudPayments не загружен. Обновите страницу и попробуйте снова.");
			return;
		}

		console.log("✅ CloudPayments доступен");
		console.log("📋 Public ID:", publicId);

		setIsLoading(true);

		try {
			console.log("🚀 Запускаем CloudPayments...");
			
			// Используем сервис для создания подписки
			const result = await cloudPaymentsService.createMonthlySubscription({
				amount: 990,
				description: "Подписка Ivy Apply AI",
				accountId: user.id,
				email: user.email,
				invoiceId: "subscription-" + Date.now(),
			});
			
			console.log("✅ Результат платежа:", result);
			
			if (result.success) {
				// Обрабатываем успешный платеж
				await handlePaymentSuccessWrapper({
					transactionId: result.data?.TransactionId || result.data?.Id || "",
					subscriptionId: result.data?.SubscriptionId,
					status: "Success",
					amount: 990,
					currency: "RUB",
					token: result.token,
				});
			} else {
				console.error("❌ Ошибка платежа:", result.error);
				if (result.error !== "Widget closed") {
					alert(`Ошибка платежа: ${result.error}`);
				}
				setIsLoading(false);
			}
			
		} catch (error) {
			console.error("❌ Ошибка при создании виджета CloudPayments:", error);
			alert("Ошибка при запуске платежной формы. Попробуйте обновить страницу.");
			setIsLoading(false);
		}
	};

	// Обработка успешного платежа
	const handlePaymentSuccessWrapper = async (paymentData: CloudPaymentsResponse) => {
		try {
			console.log("💾 Processing payment success:", paymentData);

			await handlePaymentSuccess({
				...paymentData,
				accountId: user?.id || "",
			});

			console.log("✅ Payment processed successfully");
			alert("Подписка успешно оформлена!");
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
			className={`w-full py-3 px-6 rounded-lg text-base font-medium transition-all duration-300 ${
				agreedToRecurring && user?.email_verified && !isLoading
					? "bg-notion-gray-700 text-white hover:bg-notion-gray-600"
					: "bg-notion-gray-700/30 text-notion-gray-500 cursor-not-allowed opacity-60"
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