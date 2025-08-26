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
		<div className="min-h-screen bg-white relative overflow-hidden">
			{/* Hero Section */}
			<section className="py-24 px-6 text-center relative z-10">
				<div className="max-w-5xl mx-auto relative z-10">
					{/* Neo-Brutalism Brand badge */}
					<div className="inline-flex items-center px-4 py-2 bg-white border-2 border-gray-200 rounded-full shadow-lg mb-8">
						<div className="w-2 h-2 bg-harvard-crimson rounded-full mr-2"></div>
						<span className="text-sm font-medium text-gray-700">{t.landing.hero.badge}</span>
					</div>
					
					<h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
						{t.landing.hero.title}
					</h1>
					
					<p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
						{t.landing.hero.description}
					</p>
					
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
						<button
							onClick={handleStart}
							className="w-full sm:w-auto bg-harvard-crimson text-white py-4 px-8 rounded-xl text-lg font-semibold hover:bg-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
						>
							{t.landing.hero.startButton}
						</button>
						<button
							onClick={handleSubscription}
							className="w-full sm:w-auto bg-white border-2 border-gray-200 text-gray-900 py-4 px-8 rounded-xl text-lg font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
						>
							{t.landing.hero.subscriptionButton}
						</button>
					</div>
					
					{subError && (
						<div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 max-w-md mx-auto shadow-lg">
							<div className="text-red-600 text-sm font-medium">{subError}</div>
						</div>
					)}
				</div>
			</section>

			{/* Feature Highlights - Neo-Brutalism */}
			<section className="py-20 px-6 relative z-10">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">{t.landing.features.title}</h2>
						<div className="w-24 h-1 bg-harvard-crimson mx-auto"></div>
					</div>
					<div className="space-y-12 max-w-3xl mx-auto">
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[160px] flex items-center">
							<div className="flex items-start space-x-6 w-full">
								<div className="w-14 h-14 min-w-[56px] min-h-[56px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
									1
								</div>
								<div className="flex-1 pt-2">
									<h3 className="text-2xl font-semibold text-gray-900 leading-tight">{t.landing.features.item1}</h3>
								</div>
							</div>
						</div>
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[160px] flex items-center">
							<div className="flex items-start space-x-6 w-full">
								<div className="w-14 h-14 min-w-[56px] min-h-[56px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
									2
								</div>
								<div className="flex-1 pt-2">
									<h3 className="text-2xl font-semibold text-gray-900 leading-tight">
										{t.landing.features.item2}
									</h3>
								</div>
							</div>
						</div>
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[160px] flex items-center">
							<div className="flex items-start space-x-6 w-full">
								<div className="w-14 h-14 min-w-[56px] min-h-[56px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
									3
								</div>
								<div className="flex-1 pt-2">
									<h3 className="text-2xl font-semibold text-gray-900 leading-tight">
										{t.landing.features.item3}
									</h3>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works - Neo-Brutalism */}
			<section className="py-24 px-6 relative z-10">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">{t.landing.howItWorks.title}</h2>
						<div className="w-24 h-1 bg-harvard-crimson mx-auto"></div>
					</div>
					<div className="space-y-12 max-w-3xl mx-auto">
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
							<div className="flex items-start space-x-6">
								<div className="w-14 h-14 min-w-[56px] min-h-[56px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
									1
								</div>
								<div className="flex-1 pt-2">
									<h3 className="text-2xl font-semibold text-gray-900 mb-4 leading-tight">
										{t.landing.howItWorks.step1.title}
									</h3>
									<p className="text-gray-600 text-lg leading-relaxed">
										{t.landing.howItWorks.step1.description}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
							<div className="flex items-start space-x-6">
								<div className="w-14 h-14 min-w-[56px] min-h-[56px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
									2
								</div>
								<div className="flex-1 pt-2">
									<h3 className="text-2xl font-semibold text-gray-900 mb-4 leading-tight">
										{t.landing.howItWorks.step2.title}
									</h3>
									<p className="text-gray-600 text-lg leading-relaxed">
										{t.landing.howItWorks.step2.description}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
							<div className="flex items-start space-x-6">
								<div className="w-14 h-14 min-w-[56px] min-h-[56px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
									3
								</div>
								<div className="flex-1 pt-2">
									<h3 className="text-2xl font-semibold text-gray-900 mb-4 leading-tight">
										{t.landing.howItWorks.step3.title}
									</h3>
									<p className="text-gray-600 text-lg leading-relaxed">
										{t.landing.howItWorks.step3.description}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ - Neo-Brutalism */}
			<section className="py-24 px-6 relative z-10">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-gray-900 mb-4">
							{t.landing.faq.title}
						</h2>
						<div className="w-24 h-1 bg-harvard-crimson mx-auto"></div>
					</div>
					<div className="space-y-8 max-w-3xl mx-auto">
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-sm">
									F
								</div>
								<div className="flex-1">
									<h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
										{t.landing.faq.q1.question}
									</h3>
									<p className="text-gray-600 text-lg leading-relaxed">
										{t.landing.faq.q1.answer}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-sm">
									A
								</div>
								<div className="flex-1">
									<h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
										{t.landing.faq.q2.question}
									</h3>
									<p className="text-gray-600 text-lg leading-relaxed">
										{t.landing.faq.q2.answer}
									</p>
								</div>
							</div>
						</div>
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-sm">
									Q
								</div>
								<div className="flex-1">
									<h3 className="text-xl font-semibold text-gray-900 mb-4 leading-tight">
										{t.landing.faq.q3.question}
									</h3>
									<p className="text-gray-600 text-lg leading-relaxed">
										{t.landing.faq.q3.answer}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer - Neo-Brutalism */}
			<footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-6 relative overflow-hidden">
				{/* Enhanced Background decorative elements */}
				<div className="absolute top-10 right-20 w-32 h-32 bg-harvard-crimson/10 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-10 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
				
				<div className="max-w-6xl mx-auto relative z-10">
					<div className="text-center mb-12">
						<h3 className="text-3xl font-bold mb-4">{t.landing.footer.title}</h3>
						<p className="text-gray-300 text-lg max-w-2xl mx-auto">
							{t.landing.footer.tagline}
						</p>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
						{/* Links Section */}
						<div className="text-center md:text-left">
							<h4 className="text-lg font-semibold mb-4 text-white">{t.landing.footer.legal}</h4>
							<div className="space-y-3">
								<a
									href="/user-agreement"
									target="_blank"
									rel="noopener noreferrer"
									className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300"
								>
									{t.landing.footer.userAgreement}
								</a>
								<a
									href="/public-offer"
									target="_blank"
									rel="noopener noreferrer"
									className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300"
								>
									{t.landing.footer.publicOffer}
								</a>
							</div>
						</div>
						
						{/* Contact Section */}
						<div className="text-center">
							<h4 className="text-lg font-semibold mb-4 text-white">{t.landing.footer.support}</h4>
							<div className="space-y-3">
								<a
									href="/contact"
									target="_blank"
									rel="noopener noreferrer"
									className="block text-gray-300 hover:text-white hover:translate-x-1 transition-all duration-300"
								>
									{t.landing.footer.contacts}
								</a>
							</div>
						</div>
						
						{/* Features Section */}
						<div className="text-center md:text-right">
							<h4 className="text-lg font-semibold mb-4 text-white">{t.landing.footer.features}</h4>
							<div className="space-y-3">
								<div className="text-gray-300">{t.landing.footer.aiEssayAnalysis}</div>
								<div className="text-gray-300">{t.landing.footer.universityMatching}</div>
								<div className="text-gray-300">{t.landing.footer.chatSupport}</div>
							</div>
						</div>
					</div>
					
					{/* Bottom Section */}
					<div className="border-t border-gray-700 pt-8">
						<div className="flex justify-center items-center">
							<p className="text-gray-400 text-sm">{t.landing.footer.copyright}</p>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
