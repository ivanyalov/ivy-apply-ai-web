import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useSubscription } from "../shared/hooks/useSubscription";
import { cloudPaymentsService } from "../shared/services/cloudpayments.service";

declare global {
	interface Window {
		cp: any;
	}
}

const AccessSelectionPage: React.FC = () => {
	const { user, signout } = useAuth();
	const { subscription, isLoading, cancelSubscription, refreshSubscription, startTrial } =
		useSubscription();
	const navigate = useNavigate();

	const handleMonthlySubscription = async () => {
		if (!user) {
			alert("Пожалуйста, войдите в систему, чтобы совершить платеж.");
			return;
		}

		if (!agreedToRecurring) {
			alert("Пожалуйста, согласитесь с условиями рекуррентных платежей.");
			return;
		}

		if (!cloudPaymentsService.isWidgetAvailable()) {
			alert("Платежный виджет недоступен. Пожалуйста, обновите страницу.");
			return;
		}

		try {
			const result = await cloudPaymentsService.createMonthlySubscription({
				amount: 990,
				description: "Ежемесячная подписка на Ivy Apply AI",
				accountId: user.id,
				email: user.email,
				invoiceId: `subscription_${Date.now()}`,
			});

			if (result.success) {
				alert("Подписка успешно создана! Добро пожаловать в премиум-доступ.");
				await refreshSubscription();
				navigate("/chat");
			} else {
				alert(`Ошибка создания подписки: ${result.error}`);
			}
		} catch (error) {
			console.error("Subscription error:", error);
			alert("Произошла ошибка при создании подписки.");
		}
	};

	const [trialSuccess, setTrialSuccess] = React.useState(false);
	const [agreedToRecurring, setAgreedToRecurring] = React.useState(false);
	const handleStartTrial = async () => {
		try {
			await startTrial();
			setTrialSuccess(true);
			// alert("Пробный период успешно активирован!");
		} catch (error) {
			console.error(error);
			alert("Не удалось начать пробный период. Возможно, у вас уже есть активная подписка.");
		}
	};

	const handleLogout = () => {
		signout();
		navigate("/");
	};

	if (isLoading) {
		return <div className="flex justify-center items-center h-screen">Загрузка...</div>;
	}

	const renderSubscriptionInfo = () => {
		if (!subscription) {
			return null;
		}

		const isCancelled =
			subscription.status === "cancelled" || subscription.status === "unsubscribed";
		const expiryDate = subscription.expiresAt
			? new Date(subscription.expiresAt).toLocaleDateString("ru-RU")
			: "N/A";

		return (
			<div className="border p-6 rounded-lg shadow-lg bg-white">
				<h2 className="text-2xl font-bold mb-4">Ваш Текущий План</h2>
				<p className="mb-2">
					<strong>План:</strong>{" "}
					<span className="capitalize">
						{subscription.type === "trial" ? "Пробный" : "Премиум"}
					</span>
				</p>
				<p className="mb-2">
					<strong>Статус:</strong>{" "}
					<span className="capitalize">
						{subscription.status === "active" ? "Активен" : "Неактивен"}
					</span>
				</p>
				<p className="mb-4">
					<strong>Истекает:</strong> {expiryDate}
				</p>

				{subscription.status === "active" && (
					<button
						onClick={cancelSubscription}
						className="w-full bg-harvard-crimson text-white py-2 px-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
					>
						Отменить Подписку
					</button>
				)}
				{isCancelled && (
					<p className="text-red-500 font-semibold mt-4">
						Ваша подписка неактивна. Пожалуйста, оформите новый план для продолжения.
					</p>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
			<div className="w-full max-w-4xl mx-auto">
				<div className="flex justify-between mb-4">
					<button
						onClick={() => navigate("/")}
						className="bg-white border border-gray-300 text-gray-900 px-6 py-2 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
					>
						Назад
					</button>
					<button
						onClick={handleLogout}
						className="bg-white border border-gray-300 text-gray-900 px-6 py-2 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
					>
						Выйти
					</button>
				</div>
				<h1 className="text-4xl font-bold text-center mb-8">Выберите План</h1>
				<div className="mb-8">{renderSubscriptionInfo()}</div>

				<div className="grid md:grid-cols-2 gap-8">
					<div className="border p-6 rounded-lg shadow-lg bg-white flex flex-col justify-between h-full">
						<div>
							<h2 className="text-2xl font-semibold mb-4">Премиум План</h2>
							<p className="text-4xl font-bold mb-4">
								990 RUB <span className="text-lg font-normal">/ месяц</span>
							</p>
							<ul className="mb-6 space-y-2 text-gray-600">
								<li>✓ Неограниченный доступ к AI-чату</li>
								<li>✓ Приоритетная поддержка</li>
								<li>✓ Доступ ко всем новым функциям</li>
								<li>✓ Автоматическое продление</li>
							</ul>
							<div className="mb-4">
								<label style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
									<input
										type="checkbox"
										checked={agreedToRecurring}
										onChange={(e) => setAgreedToRecurring(e.target.checked)}
										required
										style={{ marginRight: 8 }}
									/>
									<Link 
										to="/public-offer" 
										className="text-gray-700 hover:text-gray-900 underline"
										target="_blank"
									>
										Я даю согласие на автоматическое продление подписки до момента отмены
									</Link>
								</label>
							</div>
						</div>
						<button
							onClick={handleMonthlySubscription}
							disabled={!agreedToRecurring}
							className={`w-full py-2 px-4 rounded-lg text-lg font-semibold transition-colors ${
								agreedToRecurring 
									? "bg-harvard-crimson text-white hover:bg-red-800" 
									: "bg-gray-400 text-gray-600 cursor-not-allowed"
							}`}
						>
							Оформить подписку
						</button>
					</div>
					<div className="border p-6 rounded-lg shadow-lg bg-white flex flex-col justify-between h-full">
						<div>
							<h2 className="text-2xl font-semibold mb-4">Пробный План</h2>
							<p className="text-4xl font-bold mb-4">
								Бесплатно <span className="text-lg font-normal">/ 7 дней</span>
							</p>
							<ul className="mb-6 space-y-2 text-gray-600">
								<li>✓ Полный доступ к AI-чату</li>
								<li>✓ Попробуйте все функции</li>
							</ul>
						</div>
						<button
							onClick={handleStartTrial}
							disabled={subscription?.status === "active"}
							className="w-full py-2 px-4 rounded-lg text-lg font-semibold transition-colors bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
						>
							Начать пробный период
						</button>
					</div>
				</div>

				{subscription?.hasAccess && (
					<div className="text-center mt-8">
						<button
							onClick={() => navigate("/chat")}
							className="bg-harvard-crimson text-white px-6 py-2 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
						>
							Перейти в чат
						</button>
					</div>
				)}

				{trialSuccess && (
					<div className="mt-4 text-green-600 text-center font-semibold">
						Пробный период успешно активирован!
					</div>
				)}
			</div>
		</div>
	);
};

export default AccessSelectionPage;
