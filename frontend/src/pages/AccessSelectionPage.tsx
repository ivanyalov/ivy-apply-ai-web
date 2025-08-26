import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useSubscription } from "../shared/hooks/useSubscription";
import { useTranslation } from "../shared/hooks/useTranslation";
import { cloudPaymentsService } from "../shared/services/cloudpayments.service";
import { authService } from "../shared/api/auth";

declare global {
	interface Window {
		cp: any;
	}
}

const AccessSelectionPage: React.FC = () => {
	const { user, signout } = useAuth({ meRefetch: true });
	const { subscription, isLoading, cancelSubscription, refreshSubscription, startTrial } =
		useSubscription();
	const { t } = useTranslation();
	const navigate = useNavigate();
	const [resendingEmail, setResendingEmail] = React.useState(false);

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

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex justify-center items-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvard-crimson mx-auto mb-4"></div>
					<p className="text-gray-600 text-lg">{t.subscription.loading}</p>
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
			<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
				<h2 className="text-2xl font-bold text-gray-900 mb-4">{t.subscription.currentPlan}</h2>
				
				<div className="space-y-3 mb-4">
					<div className="flex justify-between items-center py-2 border-b border-gray-200">
						<span className="text-gray-600 font-medium">{t.subscription.plan}</span>
						<span className="font-semibold text-gray-900">
							{subscription.status === "unsubscribed"
								? t.subscription.notActivated
								: subscription.type === "trial"
								? t.subscription.trial
								: t.subscription.premium}
						</span>
					</div>
					<div className="flex justify-between items-center py-2 border-b border-gray-200">
						<span className="text-gray-600 font-medium">{t.subscription.status}</span>
						<span className={`font-semibold capitalize ${
							subscription.status === "active" ? "text-green-600" : "text-red-600"
						}`}>
							{subscription.status === "active" ? t.subscription.active : t.subscription.inactive}
						</span>
					</div>
					{shouldShowExpiryDate && (
						<div className="flex justify-between items-center py-2">
							<span className="text-gray-600 font-medium">{t.subscription.expires}</span>
							<span className="font-semibold text-gray-900">{expiryDate}</span>
						</div>
					)}
				</div>

				<div className="space-y-3">
					{subscription.status === "active" && (
						<button
							onClick={cancelSubscription}
							className="w-full bg-harvard-crimson text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
						>
							{t.subscription.cancelSubscription}
						</button>
					)}
					<button
						onClick={handleLogout}
						className="w-full bg-gray-800 text-white py-3 px-6 rounded-xl text-lg font-semibold hover:bg-gray-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
					>
						{t.subscription.logout}
					</button>
				</div>
				
				{isCancelled && (
					<div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mt-4 shadow-md">
						<p className="text-red-700 font-semibold text-center">
							{t.subscription.subscriptionInactive}
						</p>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-white relative overflow-hidden">
			{/* Main Content */}
			<div className="py-12 px-6 relative z-10">
				<div className="max-w-6xl mx-auto">
					{/* Neo-Brutalism Hero Section */}
					<div className="text-center mb-12">
						<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
							{t.subscription.title}
						</h1>
						<div className="w-24 h-1 bg-harvard-crimson mx-auto rounded-full shadow-lg"></div>
					</div>

					{/* Neo-Brutalism Email Verification Warning */}
					{user && !user.email_verified && (
						<div className="mb-8 bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 max-w-2xl mx-auto shadow-lg">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md">
										<svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
											<path
												fillRule="evenodd"
												d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
												clipRule="evenodd"
											/>
										</svg>
									</div>
								</div>
								<div className="ml-4 flex-1">
									<h3 className="text-lg font-semibold text-yellow-800 mb-2">{t.subscription.verifyEmailTitle}</h3>
									<p className="text-yellow-700 mb-4 text-base">
										{t.subscription.verifyEmailMessage.replace('{email}', user.email)}
									</p>
									<button
										onClick={handleResendVerificationEmail}
										disabled={resendingEmail}
										className="bg-yellow-500 text-white px-4 py-2 rounded-xl hover:bg-yellow-600 disabled:opacity-50 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1"
									>
										{resendingEmail ? t.subscription.resendingEmail : t.subscription.resendEmail}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* Neo-Brutalism Current Subscription Info */}
					<div className="mb-8 max-w-4xl mx-auto">
						{renderSubscriptionInfo()}
					</div>

					{/* Neo-Brutalism Plans Grid */}
					<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
						{/* Neo-Brutalism Premium Plan */}
						<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-4">{t.subscription.premiumPlan}</h2>
								
								<div className="mb-4">
									<div className="flex items-baseline mb-1">
										<span className="text-4xl font-bold text-gray-900">990</span>
										<span className="text-lg text-gray-600 ml-2">RUB</span>
									</div>
									<span className="text-gray-600">{t.subscription.priceMonth}</span>
								</div>
								
								<ul className="mb-4 space-y-2">
									<li className="flex items-center text-gray-700">
										<div className="w-5 h-5 bg-harvard-crimson rounded-full flex items-center justify-center mr-2 shadow-sm">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										</div>
										{t.subscription.unlimitedAccess}
									</li>
									<li className="flex items-center text-gray-700">
										<div className="w-5 h-5 bg-harvard-crimson rounded-full flex items-center justify-center mr-2 shadow-sm">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										</div>
										{t.subscription.prioritySupport}
									</li>
									<li className="flex items-center text-gray-700">
										<div className="w-5 h-5 bg-harvard-crimson rounded-full flex items-center justify-center mr-2 shadow-sm">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										</div>
										{t.subscription.allFeatures}
									</li>
									<li className="flex items-center text-gray-700">
										<div className="w-5 h-5 bg-harvard-crimson rounded-full flex items-center justify-center mr-2 shadow-sm">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										</div>
										{t.subscription.autoRenewal}
									</li>
								</ul>
								
								<div className="mb-4">
									<label className="flex items-start text-sm">
										<input
											type="checkbox"
											checked={agreedToRecurring}
											onChange={(e) => setAgreedToRecurring(e.target.checked)}
											required
											disabled={!user?.email_verified}
											className="mt-1 mr-3 h-4 w-4 text-harvard-crimson border-gray-300 rounded focus:ring-harvard-crimson"
										/>
										<Link
											to="/public-offer"
											className="text-gray-700 hover:text-gray-900 underline"
											target="_blank"
										>
											{t.subscription.recurringConsent}
										</Link>
									</label>
								</div>
							</div>
							
							<button
								onClick={handleMonthlySubscription}
								disabled={!agreedToRecurring || !user?.email_verified}
								className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 ${
									agreedToRecurring && user?.email_verified
										? "bg-harvard-crimson text-white hover:bg-red-800"
										: "bg-gray-300 text-gray-500 cursor-not-allowed"
								}`}
							>
								{!user?.email_verified ? t.subscription.verifyEmailButton : t.subscription.subscribeButton}
							</button>
						</div>

						{/* Neo-Brutalism Trial Plan */}
						<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-4">{t.subscription.trialPlan}</h2>
								
								<div className="mb-4">
									<div className="flex items-baseline mb-1">
										<span className="text-4xl font-bold text-gray-900">{t.subscription.free}</span>
									</div>
									<span className="text-gray-600">{t.subscription.days3}</span>
								</div>
								
								<ul className="mb-4 space-y-2">
									<li className="flex items-center text-gray-700">
										<div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										</div>
										{t.subscription.fullAccess}
									</li>
									<li className="flex items-center text-gray-700">
										<div className="w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
											<svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
											</svg>
										</div>
										{t.subscription.tryAllFeatures}
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
								className="w-full py-3 px-6 rounded-xl text-lg font-semibold transition-all duration-300 bg-gray-800 text-white hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-1"
							>
								{!user?.email_verified
									? t.subscription.verifyEmailButton
									: subscription?.trialUsed
									? t.subscription.trialAlreadyUsedButton
									: t.subscription.startTrialButton}
							</button>
						</div>
					</div>

					{/* Neo-Brutalism Go to Chat Button */}
					{subscription?.hasAccess && (
						<div className="text-center mt-8">
							<button
								onClick={() => navigate("/chat")}
								className="bg-harvard-crimson text-white py-4 px-8 rounded-2xl text-lg font-semibold hover:bg-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
							>
								{t.subscription.goToChatButton}
							</button>
						</div>
					)}

					{/* Neo-Brutalism Success Message */}
					{trialSuccess && (
						<div className="mt-6 text-center">
							<div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 max-w-md mx-auto shadow-lg">
								<div className="flex items-center justify-center mb-2">
									<div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2 shadow-sm">
										<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
									</div>
									<span className="text-green-800 font-semibold text-lg">
										{t.subscription.trialActivatedSuccess}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AccessSelectionPage;
