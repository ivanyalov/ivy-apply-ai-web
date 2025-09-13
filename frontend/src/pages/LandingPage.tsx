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
						<div className="w-2 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 rounded-full mr-2"></div>
						<span className="text-sm font-medium text-gray-700">{t.landing.hero.badge}</span>
					</div>
					
					<h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-12 leading-tight">
						{t.landing.hero.title}
					</h1>
					
					<p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
						{t.landing.hero.description}
					</p>
					
					<p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
						{t.landing.hero.subtitle}
					</p>
					
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
						<button
							onClick={handleStart}
							className="w-full sm:w-auto bg-gradient-to-r from-harvard-crimson to-red-600 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:shadow-red-500/25"
						>
							{t.landing.hero.startButton}
						</button>
						<button
							onClick={handleSubscription}
							className="w-full sm:w-auto bg-white border-2 border-gray-200 text-gray-900 py-4 px-8 rounded-xl text-lg font-semibold hover:bg-gray-50 hover:border-harvard-crimson/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
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

			{/* What you'll get - Enhanced Design */}
			<section className="py-24 px-6 relative z-10 bg-gradient-to-br from-gray-50 to-white">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
							{t.landing.features.title}
						</h2>
						<div className="w-32 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto rounded-full shadow-lg"></div>
					</div>
					
					{/* Enhanced grid with individual cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
						{/* Item 1 - Programs */}
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30 h-full">
								{/* Icon with gradient background */}
								<div className="mb-6">
									<div className="w-16 h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
									{t.landing.features.item1.title}
								</h3>
								{/* Decorative line */}
								<div className="mt-6 w-12 h-1 bg-gradient-to-r from-harvard-crimson to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
						</div>
						
						{/* Item 2 - Plan */}
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30 h-full">
								{/* Icon with gradient background */}
								<div className="mb-6">
									<div className="w-16 h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
									{t.landing.features.item2.title}
								</h3>
								{/* Decorative line */}
								<div className="mt-6 w-12 h-1 bg-gradient-to-r from-harvard-crimson to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
						</div>
						
						{/* Item 3 - Edits */}
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30 h-full">
								{/* Icon with gradient background */}
								<div className="mb-6">
									<div className="w-16 h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
									{t.landing.features.item3.title}
								</h3>
								{/* Decorative line */}
								<div className="mt-6 w-12 h-1 bg-gradient-to-r from-harvard-crimson to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
						</div>
						
						{/* Item 4 - Support */}
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30 h-full">
								{/* Icon with gradient background */}
								<div className="mb-6">
									<div className="w-16 h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
										</svg>
									</div>
								</div>
								<h3 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
									{t.landing.features.item4.title}
								</h3>
								{/* Decorative line */}
								<div className="mt-6 w-12 h-1 bg-gradient-to-r from-harvard-crimson to-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works - Staircase Design */}
			<section className="py-24 px-6 relative z-10 bg-gradient-to-br from-gray-50 to-white">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
							{t.landing.howItWorks.title}
						</h2>
						<div className="w-32 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto rounded-full shadow-lg"></div>
					</div>
					
					{/* Staircase Steps - Equal Width Design */}
					<div className="max-w-3xl mx-auto space-y-5">
						{/* Step 1 */}
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30">
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div className="flex-1 text-left">
										<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
											{t.landing.howItWorks.step1.title}
										</h3>
										<p className="text-gray-600 text-base leading-relaxed">
											{t.landing.howItWorks.step1.description}
										</p>
									</div>
								</div>
								{/* Arrow down */}
								<div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg">
									<svg className="w-3 h-3 text-harvard-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
									</svg>
								</div>
							</div>
						</div>

							{/* Step 2 - Slightly smaller */}
							<div className="group relative mx-6">
								<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30 min-h-[100px] flex items-center">
									<div className="flex items-center space-x-4 w-full">
										<div className="w-12 h-12 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
											</svg>
										</div>
										<div className="flex-1 text-left">
											<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
												{t.landing.howItWorks.step2.title}
											</h3>
											<p className="text-gray-600 text-base leading-relaxed">
												{t.landing.howItWorks.step2.description}
											</p>
										</div>
									</div>
								{/* Arrow down */}
								<div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg">
									<svg className="w-3 h-3 text-harvard-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
									</svg>
								</div>
							</div>
						</div>

							{/* Step 3 - Smaller */}
							<div className="group relative mx-12">
								<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30 min-h-[100px] flex items-center">
									<div className="flex items-center space-x-4 w-full">
										<div className="w-12 h-12 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
											</svg>
										</div>
										<div className="flex-1 text-left">
											<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
												{t.landing.howItWorks.step3.title}
											</h3>
											<p className="text-gray-600 text-base leading-relaxed">
												{t.landing.howItWorks.step3.description}
											</p>
										</div>
									</div>
								{/* Arrow down */}
								<div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-lg">
									<svg className="w-3 h-3 text-harvard-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
									</svg>
								</div>
							</div>
						</div>

							{/* Step 4 - Smallest */}
							<div className="group relative mx-18">
								<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:border-harvard-crimson/30 min-h-[100px] flex items-center">
									<div className="flex items-center space-x-4 w-full">
										<div className="w-12 h-12 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
											<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
										</div>
										<div className="flex-1 text-left">
											<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight group-hover:text-harvard-crimson transition-colors duration-300">
												{t.landing.howItWorks.step4.title}
											</h3>
											<p className="text-gray-600 text-base leading-relaxed">
												{t.landing.howItWorks.step4.description}
											</p>
										</div>
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
						<div className="w-24 h-1 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto"></div>
					</div>
					<div className="space-y-8 max-w-3xl mx-auto">
						<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
							<div className="flex items-start space-x-4">
								<div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 bg-gradient-to-br from-harvard-crimson to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
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
								<div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 bg-gradient-to-br from-harvard-crimson to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
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
								<div className="w-8 h-8 min-w-[32px] min-h-[32px] flex-shrink-0 bg-gradient-to-br from-harvard-crimson to-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
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
				<div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-harvard-crimson/10 to-red-600/10 rounded-full blur-3xl animate-pulse"></div>
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
									href="/privacy-policy"
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
