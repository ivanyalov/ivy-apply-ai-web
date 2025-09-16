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
		<div className="min-h-screen bg-gray-50 relative overflow-visible">
			{/* Hero Section - Modern Design */}
			<section className="pt-40 pb-40 px-6 text-center relative z-10 bg-gray-50 overflow-visible">
				<div className="max-w-6xl mx-auto relative z-40 overflow-visible">
					{/* Modern Brand badge */}
					<div className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm mb-12">
						<div className="w-3 h-3 bg-gradient-to-r from-harvard-crimson to-red-600 rounded-full mr-3"></div>
						<span className="text-sm font-semibold text-gray-800">{t.landing.hero.badge}</span>
					</div>
					
					<h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-12 leading-tight font-sans relative">
						<span className="bg-gradient-to-r from-harvard-crimson to-red-600 bg-clip-text text-transparent" style={{
							display: 'inline-block',
							lineHeight: '1.1',
							paddingBottom: '0.1em'
						}}>
						{t.landing.hero.title}
						</span>
					</h1>
					
					<div className="max-w-4xl mx-auto">
						<p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-12 leading-relaxed">
							{t.landing.hero.description}
						</p>
						
						<p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-16 leading-relaxed">
							{t.landing.hero.subtitle}
						</p>
						
						<div className="flex flex-col sm:flex-row gap-6 justify-center items-center max-w-lg mx-auto">
						<button
							onClick={handleStart}
							className="w-full sm:w-auto bg-gradient-to-r from-harvard-crimson to-red-600 text-white py-5 px-10 rounded-2xl text-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:shadow-red-500/25"
						>
							{t.landing.hero.startButton}
						</button>
						<button
							onClick={handleSubscription}
							className="w-full sm:w-auto bg-white border border-gray-200 text-gray-900 py-5 px-10 rounded-2xl text-lg font-semibold hover:bg-gray-50 hover:border-harvard-crimson/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
						>
							{t.landing.hero.subscriptionButton}
						</button>
					</div>
					</div>
					
					{subError && (
						<div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 max-w-md mx-auto shadow-lg">
							<div className="text-red-600 text-sm font-medium">{subError}</div>
						</div>
					)}
				</div>
			</section>

			{/* What you'll get - Enhanced Design */}
			<section className="py-12 md:py-24 px-4 md:px-6 relative z-1 bg-gray-50 -mt-8">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
							{t.landing.features.title}
						</h2>
						<div className="w-32 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto rounded-full shadow-lg"></div>
					</div>
					
					{/* Enhanced grid with individual cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
						{/* Item 1 - Programs */}
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg h-full">
								{/* Icon with gradient background */}
														<div className="mb-4 md:mb-4 md:mb-6">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
									</div>
								</div>
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
									{t.landing.features.item1.title}
								</h3>
							</div>
						</div>
						
								{/* Item 2 - Plan */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg h-full">
								{/* Icon with gradient background */}
														<div className="mb-4 md:mb-4 md:mb-6">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
										</svg>
									</div>
								</div>
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
											{t.landing.features.item2.title}
										</h3>
							</div>
						</div>
						
								{/* Item 3 - Edits */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg h-full">
								{/* Icon with gradient background */}
														<div className="mb-4 md:mb-4 md:mb-6">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
									</div>
								</div>
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
											{t.landing.features.item3.title}
										</h3>
							</div>
						</div>
						
								{/* Item 4 - Support */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg h-full">
								{/* Icon with gradient background */}
														<div className="mb-4 md:mb-4 md:mb-6">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
										</svg>
									</div>
								</div>
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">
											{t.landing.features.item4.title}
										</h3>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works - Staircase Design */}
			<section className="py-12 md:py-24 px-4 md:px-6 relative z-10 bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
							{t.landing.howItWorks.title}
						</h2>
						<div className="w-32 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto rounded-full shadow-lg"></div>
					</div>
					
					{/* Steps - Equal Width Design */}
					<div className="max-w-2xl mx-auto space-y-6">
								{/* Step 1 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg min-h-[160px] md:min-min-h-[160px] md:min-h-[200px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div className="flex-1 text-left">
													<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
														{t.landing.howItWorks.step1.title}
													</h3>
										<p className="text-gray-600 text-sm md:text-base leading-relaxed">
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

								{/* Step 2 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg min-h-[160px] md:min-min-h-[160px] md:min-h-[200px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
											<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
											</svg>
										</div>
										<div className="flex-1 text-left">
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">
															{t.landing.howItWorks.step2.title}
														</h3>
											<p className="text-gray-600 text-sm md:text-base leading-relaxed">
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

								{/* Step 3 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg min-h-[160px] md:min-min-h-[160px] md:min-h-[200px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
											<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
											</svg>
										</div>
										<div className="flex-1 text-left">
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">
															{t.landing.howItWorks.step3.title}
														</h3>
											<p className="text-gray-600 text-sm md:text-base leading-relaxed">
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

								{/* Step 4 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg min-h-[160px] md:min-min-h-[160px] md:min-h-[200px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
											<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
										</div>
										<div className="flex-1 text-left">
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 leading-tight">
															{t.landing.howItWorks.step4.title}
														</h3>
											<p className="text-gray-600 text-sm md:text-base leading-relaxed">
												{t.landing.howItWorks.step4.description}
											</p>
										</div>
									</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* For You Section */}
			<section className="py-12 md:py-24 px-4 md:px-6 relative z-10 bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
							{t.landing.forYou.title}
						</h2>
						<div className="w-32 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto rounded-full shadow-lg"></div>
					</div>
					
					{/* Benefits Grid */}
					<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
								{/* Benefit 1 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6 shadow-lg min-h-[120px] md:min-h-[160px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
										</svg>
									</div>
									<div className="flex-1 text-left flex items-center">
															<p className="text-gray-700 text-lg md:text-xl lg:text-2xl leading-relaxed font-bold" dangerouslySetInnerHTML={{
																__html: t.landing.forYou.benefit1.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>').replace(/^([а-яёa-z])/i, '<span class="uppercase">$1</span>')
															}} />
									</div>
								</div>
							</div>
						</div>

								{/* Benefit 2 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6 shadow-lg min-h-[120px] md:min-h-[160px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
									</div>
									<div className="flex-1 text-left flex items-center">
															<p className="text-gray-700 text-lg md:text-xl lg:text-2xl leading-relaxed font-bold" dangerouslySetInnerHTML={{
																__html: t.landing.forYou.benefit2.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>').replace(/^([а-яёa-z])/i, '<span class="uppercase">$1</span>')
															}} />
									</div>
								</div>
							</div>
						</div>

								{/* Benefit 3 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6 shadow-lg min-h-[120px] md:min-h-[160px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</div>
									<div className="flex-1 text-left flex items-center">
															<p className="text-gray-700 text-lg md:text-xl lg:text-2xl leading-relaxed font-bold" dangerouslySetInnerHTML={{
																__html: t.landing.forYou.benefit3.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>').replace(/^([а-яёa-z])/i, '<span class="uppercase">$1</span>')
															}} />
									</div>
								</div>
							</div>
						</div>

								{/* Benefit 4 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-4 md:p-6 shadow-lg min-h-[120px] md:min-h-[160px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
										</svg>
									</div>
									<div className="flex-1 text-left flex items-center">
															<p className="text-gray-700 text-lg md:text-xl lg:text-2xl leading-relaxed font-bold" dangerouslySetInnerHTML={{
																__html: t.landing.forYou.benefit4.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>').replace(/^([а-яёa-z])/i, '<span class="uppercase">$1</span>')
															}} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Why Us Section */}
			<section className="py-12 md:py-24 px-4 md:px-6 relative z-10 bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
							{t.landing.whyUs.title}
						</h2>
						<div className="w-32 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto rounded-full shadow-lg"></div>
					</div>
					
					{/* Benefits Grid - Fixed Height Design */}
					<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
								{/* Benefit 1 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg min-h-[180px] md:min-h-[220px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
										</svg>
									</div>
									<div className="flex-1 text-left">
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 leading-tight">
															{t.landing.whyUs.benefit1.split('**')[1]}
														</h3>
										<p className="text-gray-600 text-sm md:text-base leading-relaxed">
											{t.landing.whyUs.benefit1.split('**')[2]}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Benefit 2 */}
								<div className="group relative">
									<div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-lg min-h-[180px] md:min-h-[220px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<svg className="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
										</svg>
									</div>
									<div className="flex-1 text-left">
														<h3 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-4 leading-tight">
															{t.landing.whyUs.benefit2.split('**')[1]}
														</h3>
										<p className="text-gray-600 text-sm md:text-base leading-relaxed">
											{t.landing.whyUs.benefit2.split('**')[2]}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ - Modern Design */}
			<section className="py-12 md:py-24 px-4 md:px-6 relative z-10 bg-gray-50">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
							{t.landing.faq.title}
						</h2>
						<div className="w-32 h-2 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto rounded-full shadow-lg"></div>
					</div>
					<div className="max-w-xl mx-auto space-y-5">
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg min-h-[160px] md:min-h-[200px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<span className="text-white font-bold text-xl">F</span>
								</div>
									<div className="flex-1 text-left">
										<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
										{t.landing.faq.q1.question}
									</h3>
										<p className="text-gray-600 text-sm md:text-base leading-relaxed">
										{t.landing.faq.q1.answer}
									</p>
									</div>
								</div>
							</div>
						</div>
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg min-h-[160px] md:min-h-[200px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<span className="text-white font-bold text-xl">A</span>
								</div>
									<div className="flex-1 text-left">
										<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
										{t.landing.faq.q2.question}
									</h3>
										<p className="text-gray-600 text-sm md:text-base leading-relaxed">
										{t.landing.faq.q2.answer}
									</p>
									</div>
								</div>
							</div>
						</div>
						<div className="group relative">
							<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg min-h-[160px] md:min-h-[200px] flex items-center">
														<div className="flex items-center space-x-3 md:space-x-6 w-full">
														<div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-harvard-crimson to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 flex-shrink-0">
										<span className="text-white font-bold text-xl">Q</span>
								</div>
									<div className="flex-1 text-left">
										<h3 className="text-2xl font-bold text-gray-900 mb-1 leading-tight">
										{t.landing.faq.q3.question}
									</h3>
										<p className="text-gray-600 text-sm md:text-base leading-relaxed">
										{t.landing.faq.q3.answer}
									</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Footer - Modern Design */}
			<footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white py-12 px-6 relative overflow-hidden">
				{/* Enhanced Background decorative elements */}
				<div className="absolute top-10 right-20 w-32 h-32 bg-gradient-to-br from-harvard-crimson/20 to-red-600/20 rounded-full blur-3xl animate-pulse"></div>
				<div className="absolute bottom-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-harvard-crimson/5 to-red-600/5 rounded-full blur-3xl"></div>
				
				
				<div className="max-w-7xl mx-auto relative z-10">
					{/* Header Section */}
					<div className="text-center mb-8 md:mb-12">
						<h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
							{t.landing.footer.title}
						</h3>
						<p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
							{t.landing.footer.tagline}
						</p>
						{/* Decorative line */}
						<div className="w-24 h-1 bg-gradient-to-r from-harvard-crimson to-red-600 mx-auto mt-6 rounded-full"></div>
					</div>
					
					{/* Links Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8 md:mb-12">
						{/* Legal Section */}
						<div className="text-center md:text-left group">
							<div className="flex items-center justify-center md:justify-start mb-4 md:mb-6">
								<div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-harvard-crimson/20 to-red-600/20 rounded-xl flex items-center justify-center mr-3 md:mr-4 group-hover:scale-110 transition-transform duration-300">
									<svg className="w-5 h-5 md:w-6 md:h-6 text-harvard-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<h4 className="text-lg md:text-xl font-bold text-white group-hover:text-harvard-crimson transition-colors duration-300">
									{t.landing.footer.legal}
								</h4>
							</div>
							<div className="space-y-3 md:space-y-4">
								<a
									href="/privacy-policy"
									target="_blank"
									rel="noopener noreferrer"
									className="block text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 group/link"
								>
									<span className="flex items-center">
										<span className="w-2 h-2 bg-harvard-crimson rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
										{t.landing.footer.userAgreement}
									</span>
								</a>
								<a
									href="/public-offer"
									target="_blank"
									rel="noopener noreferrer"
									className="block text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 group/link"
								>
									<span className="flex items-center">
										<span className="w-2 h-2 bg-harvard-crimson rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
										{t.landing.footer.publicOffer}
									</span>
								</a>
							</div>
						</div>
						
						{/* Support Section */}
						<div className="text-center group">
							<div className="flex items-center justify-center mb-4 md:mb-6">
								<div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-harvard-crimson/20 to-red-600/20 rounded-xl flex items-center justify-center mr-3 md:mr-4 group-hover:scale-110 transition-transform duration-300">
									<svg className="w-5 h-5 md:w-6 md:h-6 text-harvard-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
									</svg>
								</div>
								<h4 className="text-lg md:text-xl font-bold text-white group-hover:text-harvard-crimson transition-colors duration-300">
									{t.landing.footer.support}
								</h4>
							</div>
							<div className="space-y-3 md:space-y-4">
								<a
									href="/contact"
									target="_blank"
									rel="noopener noreferrer"
									className="block text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 group/link"
								>
									<span className="flex items-center justify-center">
										<span className="w-2 h-2 bg-harvard-crimson rounded-full mr-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300"></span>
										{t.landing.footer.contacts}
									</span>
								</a>
							</div>
						</div>
						
						{/* Features Section */}
						<div className="text-center md:text-right group">
							<div className="flex items-center justify-center md:justify-end mb-4 md:mb-6">
								<div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-harvard-crimson/20 to-red-600/20 rounded-xl flex items-center justify-center mr-3 md:mr-4 group-hover:scale-110 transition-transform duration-300">
									<svg className="w-5 h-5 md:w-6 md:h-6 text-harvard-crimson" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
									</svg>
								</div>
								<h4 className="text-lg md:text-xl font-bold text-white group-hover:text-harvard-crimson transition-colors duration-300">
									{t.landing.footer.features}
								</h4>
							</div>
							<div className="space-y-3 md:space-y-4">
								<div className="text-gray-300 hover:text-white transition-colors duration-300 group/feature">
									<span className="flex items-center justify-center md:justify-end">
										<span className="w-2 h-2 bg-harvard-crimson rounded-full mr-3 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300"></span>
										{t.landing.footer.aiEssayAnalysis}
									</span>
								</div>
								<div className="text-gray-300 hover:text-white transition-colors duration-300 group/feature">
									<span className="flex items-center justify-center md:justify-end">
										<span className="w-2 h-2 bg-harvard-crimson rounded-full mr-3 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300"></span>
										{t.landing.footer.universityMatching}
									</span>
								</div>
								<div className="text-gray-300 hover:text-white transition-colors duration-300 group/feature">
									<span className="flex items-center justify-center md:justify-end">
										<span className="w-2 h-2 bg-harvard-crimson rounded-full mr-3 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300"></span>
										{t.landing.footer.chatSupport}
									</span>
								</div>
							</div>
						</div>
					</div>
					
					{/* Bottom Section */}
					<div className="border-t border-gradient-to-r from-transparent via-gray-700 to-transparent pt-8">
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
