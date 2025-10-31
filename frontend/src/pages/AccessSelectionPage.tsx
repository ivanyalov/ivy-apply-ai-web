import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useSubscription } from "../shared/hooks/useSubscription";
import { useTranslation } from "../shared/hooks/useTranslation";
import { useLanguage } from "../shared/hooks/useLanguage";
import { cloudPaymentsService } from "../shared/services/cloudpayments.service";
import { authService } from "../shared/api/auth";
import SubscribeButton from "../features/Subscription/SubscribeButton";
import ConfirmModal from "../shared/components/ConfirmModal";

declare global {
	interface Window {
		cp: any;
	}
}

const AccessSelectionPage: React.FC = () => {
	const { user, signout } = useAuth({ meRefetch: true });
	const {
		subscription,
		isLoading,
		cancelSubscription,
		refreshSubscription,
		startTrial,
		isCancelling,
	} = useSubscription();
	const { t } = useTranslation();
	const { language, toggleLanguage } = useLanguage();
	const navigate = useNavigate();
	const [resendingEmail, setResendingEmail] = React.useState(false);
	const [showCancelModal, setShowCancelModal] = React.useState(false);

	const handleMonthlySubscription = async () => {
		if (!user) {
			alert(t.subscription.loginPrompt);
			return;
		}

		if (!agreedToRecurring) {
			alert(t.subscription.agreeRecurring);
			return;
		}

		if (!cloudPaymentsService.isWidgetAvailable()) {
			alert(t.subscription.widgetUnavailable);
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
				alert(t.subscription.subscriptionSuccess);
				await refreshSubscription();
				navigate("/chat");
			} else {
				alert(`${t.subscription.subscriptionError}: ${result.error}`);
			}
		} catch (error) {
			console.error("Subscription error:", error);
			alert(t.subscription.subscriptionError);
		}
	};

	const [trialSuccess, setTrialSuccess] = React.useState(false);
	const [agreedToRecurring, setAgreedToRecurring] = React.useState(false);

	const handleCancelSubscription = async () => {
		try {
			await cancelSubscription();
			setShowCancelModal(false);
			alert(t.subscription.cancelSuccess);
			window.location.reload(); // Перезагружаем страницу
		} catch (error) {
			console.error("Ошибка отмены подписки:", error);
			alert(t.subscription.cancelError);
		}
	};

	const handleStartTrial = async () => {
		try {
			await startTrial();
			setTrialSuccess(true);
		} catch (error: any) {
			console.error(error);
			const errorMessage = error.response?.data?.error || error.message;
			if (errorMessage === "User has already used their trial period.") {
				alert(t.subscription.trialAlreadyUsed);
			} else if (errorMessage === "User already has an active subscription or trial.") {
				alert(t.subscription.alreadyHasSubscription);
			} else {
				alert(t.subscription.trialStartError);
			}
		}
	};

	const handleLogout = () => {
		signout();
		navigate("/");
	};

	const handleResendVerificationEmail = async () => {
		if (!user?.email) return;

		setResendingEmail(true);
		try {
			await authService.resendVerificationEmail(user.email);
			alert(t.subscription.emailResent);
		} catch (error: any) {
			if (error.response?.status === 409) {
				alert(t.subscription.emailAlreadyVerified);
			} else {
				alert(t.subscription.emailResendError);
			}
		} finally {
			setResendingEmail(false);
		}
	};

	const handleStart = () => {
		if (user && subscription?.hasAccess) {
			navigate('/chat');
		} else if (user && !subscription?.hasAccess) {
			// Already on access page
		} else {
			navigate('/login');
		}
	};

	const handleSubscription = () => {
		// Already on access page
	};

	if (isLoading) {
		return (
			<div className="min-h-screen bg-notion-gray-50 flex justify-center items-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-gray-700 mx-auto mb-4"></div>
					<p className="text-notion-gray-600 text-lg">{t.subscription.loading}</p>
				</div>
			</div>
		);
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

		const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) <= new Date();
		const shouldShowExpiryDate = subscription.status === "active";

		return (
			<div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300">
				<h2 className="text-2xl font-bold text-notion-gray-700 mb-6 font-dm-sans">{t.subscription.currentPlan}</h2>

				<div className="space-y-4 mb-6">
					<div className="flex justify-between items-center py-3 border-b border-gray-100">
						<span className="text-notion-gray-600 font-medium text-base">{t.subscription.plan}</span>
						<span className="font-semibold text-notion-gray-700 text-base">
							{subscription.status === "unsubscribed"
								? t.subscription.notActivated
								: subscription.type === "trial"
								? t.subscription.trial
								: t.subscription.premium}
						</span>
					</div>
					<div className="flex justify-between items-center py-3 border-b border-gray-100">
						<span className="text-notion-gray-600 font-medium text-base">{t.subscription.status}</span>
						<span
							className={`font-semibold capitalize text-base ${
								subscription.status === "active" ? "text-green-600" : "text-red-600"
							}`}
						>
							{subscription.status === "active" ? t.subscription.active : t.subscription.inactive}
						</span>
					</div>
					{shouldShowExpiryDate && (
						<div className="flex justify-between items-center py-3">
							<span className="text-notion-gray-600 font-medium text-base">{t.subscription.expires}</span>
							<span className="font-semibold text-notion-gray-700 text-base">{expiryDate}</span>
						</div>
					)}
				</div>

				<div className="space-y-3">
					{subscription.status === "active" && (
						<button
							onClick={() => setShowCancelModal(true)}
							className="w-full bg-white text-red-600 border border-red-200 py-3 px-6 rounded-md text-base font-medium hover:bg-red-50 hover:border-red-300 transition-all duration-300"
						>
							{subscription.type === "trial" 
								? t.subscription.cancelTrial 
								: t.subscription.cancelSubscriptionText
							}
						</button>
					)}
					<button
						onClick={handleLogout}
						className="w-full bg-notion-gray-700 text-white py-3 px-6 rounded-md text-base font-medium hover:bg-notion-gray-600 transition-all duration-300"
					>
						{t.subscription.logout}
					</button>
				</div>

				{isCancelled && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
						<p className="text-red-700 font-medium text-center text-base">
							{t.subscription.subscriptionInactive}
						</p>
					</div>
				)}
			</div>
		);
	};

	const shouldShowPlans = () => {
		if (!user) {
			return false; // Не показываем планы для неавторизованных пользователей
		}
		if (!user.email_verified) {
			return false; // Не показываем планы для неподтвержденных email
		}

		// Если подписка активна и это trial - показываем только premium для апгрейда
		if (subscription?.status === "active" && subscription?.type === "trial") {
			return "premium-only";
		}

		// Если подписка активна и это premium - скрываем все планы
		if (subscription?.status === "active" && subscription?.type === "premium") {
			return false;
		}

		// Если подписка отменена/неактивна и пробный период использован - показываем только premium
		if (
			(subscription?.status === "cancelled" || subscription?.status === "unsubscribed") &&
			subscription?.trialUsed
		) {
			return "premium-only";
		}

		return "both"; // Показываем оба плана в остальных случаях
	};

	return (
		<div className="min-h-screen bg-notion-gray-50">
			{/* Navigation */}
			<nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50">
				<div className="w-full px-6 py-4 flex justify-between items-center">
					{/* Home Icon */}
					<button
						onClick={() => navigate('/')}
						className="text-notion-gray-700 hover:text-notion-gray-600 transition-colors"
						aria-label="Go to home page"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
						</svg>
					</button>

					<div className="flex items-center gap-4">
						<button
							onClick={toggleLanguage}
							className="px-3 py-1.5 text-sm text-notion-gray-600 hover:text-notion-gray-700 hover:bg-notion-gray-50 rounded-md transition-colors"
						>
							{language === 'ru' ? 'EN' : 'RU'}
						</button>
						<button
							onClick={handleSubscription}
							className="px-4 py-1.5 text-sm font-medium text-notion-gray-700 bg-white border border-notion-gray-300 hover:bg-notion-gray-50 rounded-md transition-colors"
						>
							{t.landing.hero.subscriptionButton}
						</button>
						<button
							onClick={handleStart}
							className="px-4 py-1.5 text-sm font-medium text-white bg-notion-gray-700 hover:bg-notion-gray-600 rounded-md transition-colors"
						>
							{user ? t.landing.hero.startButton : t.landing.hero.startButton}
						</button>
					</div>
				</div>
			</nav>

			{/* Main Content */}
			<div className="pt-32 pb-20 px-6 relative z-10">
				<div className="max-w-6xl mx-auto">
					{/* Hero Section */}
					<div className="text-center mb-16">
						<h1 className="text-4xl md:text-5xl font-extralight text-notion-gray-700 mb-6 leading-tight tracking-tight font-dm-sans">
							<span className="bg-gradient-to-r from-notion-gray-700 via-notion-gray-600 to-notion-gray-700 bg-clip-text text-transparent">
								{t.subscription.title}
							</span>
						</h1>
						<div className="w-24 h-1 bg-notion-gray-700 mx-auto rounded-full"></div>
					</div>

					{/* Email Verification Warning */}
					{user && !user.email_verified && (
						<div className="mb-8 bg-white rounded-lg border border-gray-100 p-10 max-w-2xl mx-auto shadow-sm hover:shadow-md transition-all duration-300">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center">
										<svg className="h-7 w-7 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
											<path
												fillRule="evenodd"
												d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								</div>
								<div className="ml-6 flex-1">
									<h3 className="text-xl font-bold text-notion-gray-700 font-dm-sans mb-3">
										{t.subscription.verifyEmailTitle}
									</h3>
									<p className="text-notion-gray-600 mb-6 text-base leading-relaxed">
										{t.subscription.verifyEmailMessage.replace("{email}", user.email)}
									</p>
									<button
										onClick={handleResendVerificationEmail}
										disabled={resendingEmail}
										className="bg-amber-500/90 text-white px-8 py-4 rounded-lg hover:bg-amber-600/90 disabled:opacity-50 transition-all duration-300 font-medium"
									>
										{resendingEmail ? t.subscription.resendingEmail : t.subscription.resendEmail}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Neo-Brutalism Current Subscription Info */}
					<div className="mb-8 max-w-4xl mx-auto">{renderSubscriptionInfo()}</div>

					{/* Neo-Brutalism Plans Grid */}
					{shouldShowPlans() && (
						<div
							className={`grid gap-6 max-w-4xl mx-auto ${
								shouldShowPlans() === "premium-only" ? "md:grid-cols-1" : "md:grid-cols-2"
							}`}
						>
							{/* Premium Plan */}
							<div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
								<div>
									<h2 className="text-2xl font-bold text-notion-gray-700 mb-6 font-dm-sans">
										{t.subscription.premiumPlan}
									</h2>

									<div className="mb-6">
										<div className="flex items-baseline mb-2">
											<span className="text-5xl font-bold text-notion-gray-700 font-dm-sans">990</span>
											<span className="text-xl text-notion-gray-600 ml-2">RUB</span>
										</div>
										<span className="text-notion-gray-600 text-base">{t.subscription.priceMonth}</span>
									</div>

									<ul className="mb-6 space-y-3">
										<li className="flex items-center text-notion-gray-600 text-base">
											<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
												<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											{t.subscription.unlimitedAccess}
										</li>
										<li className="flex items-center text-notion-gray-600 text-base">
											<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
												<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											{t.subscription.prioritySupport}
										</li>
										<li className="flex items-center text-notion-gray-600 text-base">
											<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
												<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											{t.subscription.allFeatures}
										</li>
										<li className="flex items-center text-notion-gray-600 text-base">
											<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
												<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
													<path
														fillRule="evenodd"
														d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
														clipRule="evenodd"
													/>
												</svg>
											</div>
											{t.subscription.autoRenewal}
										</li>
									</ul>

									<div className="mb-6">
										<label className="flex items-start text-base">
											<input
												type="checkbox"
												checked={agreedToRecurring}
												onChange={(e) => setAgreedToRecurring(e.target.checked)}
												required
												disabled={!user?.email_verified}
												className="mt-1 mr-3 h-4 w-4 text-notion-gray-700 border-gray-300 rounded focus:ring-notion-gray-700"
											/>
											<Link
												to="/public-offer"
												className="text-notion-gray-600 hover:text-notion-gray-700 underline"
												target="_blank"
											>
												{t.subscription.recurringConsent}
											</Link>
										</label>
									</div>
								</div>

								<SubscribeButton agreedToRecurring={agreedToRecurring} />
							</div>

							{/* Trial Plan - показываем только если не "premium-only" */}
							{shouldShowPlans() !== "premium-only" && (
								<div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
									<div>
										<h2 className="text-2xl font-bold text-notion-gray-700 mb-6 font-dm-sans">
											{t.subscription.trialPlan}
										</h2>

										<div className="mb-6">
											<div className="flex items-baseline mb-2">
												<span className="text-5xl font-bold text-notion-gray-700 font-dm-sans">
													{t.subscription.free}
												</span>
											</div>
											<span className="text-notion-gray-600 text-base">{t.subscription.days3}</span>
										</div>

										<ul className="mb-6 space-y-3">
											<li className="flex items-center text-notion-gray-600 text-base">
												<div className="w-6 h-6 bg-notion-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												{t.subscription.fullAccess}
											</li>
											<li className="flex items-center text-notion-gray-600 text-base">
												<div className="w-6 h-6 bg-notion-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												{t.subscription.tryAllFeatures}
											</li>
											<li className="flex items-center text-notion-gray-600 text-base">
												<div className="w-6 h-6 bg-notion-gray-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
													<svg
														className="w-3 h-3 text-white"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
															clipRule="evenodd"
														/>
													</svg>
												</div>
												{t.subscription.noCardRequired}
											</li>
										</ul>
									</div>

									<button
										onClick={handleStartTrial}
										disabled={
											subscription?.status === "active" ||
											!user?.email_verified ||
											subscription?.trialUsed
										}
										className="w-full py-3 px-6 rounded-lg text-base font-medium transition-all duration-300 bg-notion-gray-700 text-white hover:bg-notion-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
									>
										{!user?.email_verified
											? t.subscription.verifyEmailButton
											: subscription?.trialUsed
											? subscription?.status === "active" && subscription?.trialUsed
												? t.subscription.trialCurrentlyUsedButton
												: t.subscription.trialAlreadyUsedButton
											: t.subscription.startTrialButton}
									</button>
								</div>
							)}
						</div>
					)}
					{/* Go to Chat Button */}
					{subscription?.hasAccess && (
						<div className="text-center mt-8">
							<button
								onClick={() => navigate("/chat")}
								className="bg-notion-gray-700 text-white py-4 px-8 rounded-lg text-base font-medium hover:bg-notion-gray-600 transition-all duration-300"
							>
								{t.subscription.goToChatButton}
							</button>
						</div>
					)}

					{/* Success Message - Green Rectangular */}
					{trialSuccess && (
						<div className="mt-6 text-center">
							<div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto shadow-sm">
								<div className="flex items-center justify-center">
									<div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
										<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path
												fillRule="evenodd"
												d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
									<span className="text-green-800 font-medium text-base">
										{t.subscription.trialActivatedSuccess}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Модальное окно подтверждения отмены подписки */}
			<ConfirmModal
				isOpen={showCancelModal}
				onClose={() => setShowCancelModal(false)}
				onConfirm={handleCancelSubscription}
				title={t.subscription.confirmCancelTitle}
				message={t.subscription.confirmCancelMessage}
				confirmText={t.subscription.confirmCancelButton}
				cancelText={t.subscription.confirmCancelCancel}
				isLoading={isCancelling}
				isDangerous={true}
			/>
		</div>
	);
};

export default AccessSelectionPage;
