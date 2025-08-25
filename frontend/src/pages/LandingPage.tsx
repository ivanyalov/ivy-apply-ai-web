import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useSubscription } from "../shared/hooks/useSubscription";
import { useTranslation } from "../shared/hooks/useTranslation";

/**
 * @component LandingPage
 * @description Главная страница приложения с описанием сервиса и кнопками для начала работы.
 * Предоставляет информацию о возможностях AI-помощника и вариантах подписки.
 *
 * @returns {JSX.Element} Главная страница с hero-секцией, описанием функций и FAQ.
 *
 * @example
 * ```tsx
 * <LandingPage />
 * ```
 */
const LandingPage: React.FC = () => {
	const navigate = useNavigate();
	const { subscription } = useSubscription();
	const { isAuthenticated } = useAuth();
	const { t } = useTranslation();
	const [subError, setSubError] = useState<string | null>(null);

	/**
	 * @method handleStart
	 * @description Обрабатывает нажатие кнопки "Начать".
	 * Перенаправляет пользователя на страницу аутентификации или чата в зависимости от статуса подписки.
	 */
	const handleStart = () => {
		if (isAuthenticated && subscription?.hasAccess) {
			navigate("/chat");
		} else if (isAuthenticated && !subscription?.hasAccess) {
			navigate("/access");
		} else {
			navigate("/login");
		}
	};

	/**
	 * @method handleSubscription
	 * @description Обрабатывает нажатие кнопки "Подписка".
	 * Перенаправляет пользователя на страницу выбора подписки.
	 */
	const handleSubscription = () => {
		navigate("/access");
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<section className="py-20 px-6 text-center">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-5xl font-bold text-gray-900 mb-6">{t.landing.hero.title}</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						{t.landing.hero.description}
					</p>
					<div className="w-60 mx-auto">
						<button
							onClick={handleStart}
							className="w-full bg-harvard-crimson text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
						>
							{t.landing.hero.startButton}
						</button>
						<div className="mt-4">
							<button
								onClick={handleSubscription}
								className="w-full bg-white border border-gray-300 text-gray-900 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
							>
								{t.landing.hero.subscriptionButton}
							</button>
						</div>
					</div>
					{subError && <div className="mt-2 text-red-600 text-sm">{subError}</div>}
				</div>
			</section>

			{/* Feature Highlights */}
			<section className="py-16 px-6">
				<div className="max-w-6xl mx-auto">
					<div className="flex flex-col items-center mb-8">
						<h2 className="text-3xl font-bold text-gray-900 text-center">{t.landing.features.title}</h2>
					</div>
					<div className="space-y-8 w-fit mx-auto">
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								1
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900">{t.landing.features.item1}</h3>
							</div>
						</div>
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								2
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900">
									{t.landing.features.item2}
								</h3>
							</div>
						</div>
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								3
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900">
									{t.landing.features.item3}
								</h3>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-16 px-6 bg-white">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl font-bold text-gray-900 text-center mb-12">{t.landing.howItWorks.title}</h2>
					<div className="space-y-8">
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								1
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{t.landing.howItWorks.step1.title}
								</h3>
								<p className="text-gray-600">
									{t.landing.howItWorks.step1.description}
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								2
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{t.landing.howItWorks.step2.title}
								</h3>
								<p className="text-gray-600">
									{t.landing.howItWorks.step2.description}
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 min-w-[48px] min-h-[48px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								3
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{t.landing.howItWorks.step3.title}
								</h3>
								<p className="text-gray-600">
									{t.landing.howItWorks.step3.description}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="py-16 px-6">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
						{t.landing.faq.title}
					</h2>
					<div className="space-y-6">
						<div className="border-b border-gray-200 pb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{t.landing.faq.q1.question}
							</h3>
							<p className="text-gray-600">
								{t.landing.faq.q1.answer}
							</p>
						</div>
						<div className="border-b border-gray-200 pb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">{t.landing.faq.q2.question}</h3>
							<p className="text-gray-600">
								{t.landing.faq.q2.answer}
							</p>
						</div>
						<div className="border-b border-gray-200 pb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								{t.landing.faq.q3.question}
							</h3>
							<p className="text-gray-600">
								{t.landing.faq.q3.answer}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-white text-gray-900 py-12 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h3 className="text-2xl font-bold mb-6">{t.landing.footer.title}</h3>
					<div className="flex justify-center space-x-8 mb-8">
						<a
							href="/user-agreement"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 hover:text-gray-700 transition-colors"
						>
							{t.landing.footer.userAgreement}
						</a>
						<a
							href="/public-offer"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 hover:text-gray-700 transition-colors"
						>
							{t.landing.footer.publicOffer}
						</a>
						<a
							href="/contact"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 hover:text-gray-700 transition-colors"
						>
							{t.landing.footer.contacts}
						</a>
					</div>
					<p className="text-gray-600">{t.landing.footer.copyright}</p>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
