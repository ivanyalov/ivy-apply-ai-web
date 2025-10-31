import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useSubscription } from "../shared/hooks/useSubscription";
import { useTranslation } from "../shared/hooks/useTranslation";
import { useLanguage } from "../shared/hooks/useLanguage";

const LandingPage: React.FC = () => {
	const navigate = useNavigate();
	const { subscription } = useSubscription();
	const { isAuthenticated } = useAuth();
	const { t } = useTranslation();
	const { language, toggleLanguage } = useLanguage();
	const [openFAQ, setOpenFAQ] = useState<number | null>(null);

	const handleStart = () => {
		if (isAuthenticated && subscription?.hasAccess) {
			navigate("/chat");
		} else if (isAuthenticated && !subscription?.hasAccess) {
			navigate("/access");
		} else {
			navigate("/login");
		}
	};

	const handleSubscription = () => {
		navigate("/access");
	};

	const toggleFAQ = (index: number) => {
		setOpenFAQ(openFAQ === index ? null : index);
	};

	return (
		<div className="min-h-screen bg-white">
			{/* Simple Navigation */}
			<nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50">
				<div className="w-full px-6 py-4 flex justify-end items-center">
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
							{isAuthenticated ? t.landing.hero.startButton : t.landing.hero.startButton}
						</button>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="pt-40 pb-20 px-6">
				<div className="max-w-6xl mx-auto text-center">
					{/* Enhanced Title */}
					<h1 className="text-9xl md:text-[12rem] font-extralight text-notion-gray-700 mb-20 tracking-tight leading-none font-dm-sans">
						<span className="bg-gradient-to-r from-notion-gray-700 via-notion-gray-600 to-notion-gray-700 bg-clip-text text-transparent">
							{t.landing.hero.title}
						</span>
					</h1>
					
					{/* Value Propositions - Moved below title */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 w-full max-w-6xl mx-auto px-4 md:px-12 mb-16">
						<button
							onClick={handleStart}
							className="bg-notion-gray-50 rounded-xl py-8 px-12 md:px-16 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center group"
						>
							<p className="text-lg md:text-xl font-bold text-notion-gray-700 text-center group-hover:text-notion-gray-800 transition-colors" dangerouslySetInnerHTML={{ __html: t.landing.hero.valueProp1 }}>
							</p>
						</button>
						<button
							onClick={handleStart}
							className="bg-notion-gray-50 rounded-xl py-8 px-12 md:px-16 border border-gray-100 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center group"
						>
							<p className="text-lg md:text-xl font-bold text-notion-gray-700 text-center group-hover:text-notion-gray-800 transition-colors" dangerouslySetInnerHTML={{ __html: t.landing.hero.valueProp2 }}>
							</p>
						</button>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 px-6 bg-notion-gray-50">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-notion-gray-700 text-center mb-16 font-dm-sans">
						{t.landing.about.title}
					</h2>
					<div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
						{/* Feature 1 */}
						<div className="bg-white rounded-xl p-10 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
							<div className="w-16 h-16 bg-notion-gray-50 rounded-xl flex items-center justify-center mb-8">
								<svg className="w-8 h-8 text-notion-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
								</svg>
							</div>
							<div className="space-y-6 text-[#333333] text-[18px] leading-[1.8]">
								<p>
									{t.landing.about.feature1.title}
								</p>
								
								<p>
									{t.landing.about.feature1.subtitle}
								</p>
								<ul className="space-y-3 pl-4">
									{t.landing.about.feature1.items.map((item, index) => (
										<li key={index} className="flex items-start">
											<span className="w-1.5 h-1.5 bg-[#333333] rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Feature 2 */}
						<div className="bg-white rounded-xl p-10 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
							<div className="w-16 h-16 bg-notion-gray-50 rounded-xl flex items-center justify-center mb-8">
								<svg className="w-8 h-8 text-notion-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
								</svg>
							</div>
							<div className="space-y-6 text-[#333333] text-[18px] leading-[1.8]">
								<p>
									{t.landing.about.feature2.title}
								</p>
								
								<p>
									{t.landing.about.feature2.subtitle}
								</p>
								<ul className="space-y-3 pl-4">
									{t.landing.about.feature2.items.map((item, index) => (
										<li key={index} className="flex items-start">
											<span className="w-1.5 h-1.5 bg-[#333333] rounded-full mt-2.5 mr-3 flex-shrink-0"></span>
											<span>{item}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-20 px-6">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-notion-gray-700 text-center mb-16 font-dm-sans">
						{t.landing.howItWorks.title}
					</h2>
					<div className="space-y-6">
						<div className="bg-notion-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
							<div className="flex items-start gap-4">
								<div className="w-8 h-8 bg-notion-gray-700 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									1
								</div>
								<div className="text-notion-gray-700 text-[18px] leading-[1.7]">
									<h3 className="text-lg font-semibold text-notion-gray-700 mb-4 font-dm-sans">
										{t.landing.howItWorks.step1Title}
									</h3>
									
									<div>
										<p className="font-medium mb-3">{t.landing.howItWorks.step1Example}</p>
										<p className="mb-3">
											{t.landing.howItWorks.step1ExampleText}
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-notion-gray-50 rounded-xl p-8 border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]">
							<div className="flex items-start gap-4">
								<div className="w-8 h-8 bg-notion-gray-700 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
									2
								</div>
								<div className="text-notion-gray-700 text-[18px] leading-[1.7]">
									<h3 className="text-lg font-semibold text-notion-gray-700 mb-4 font-dm-sans">
										{t.landing.howItWorks.step2Title}
									</h3>
									
									<p className="mb-4">
										{t.landing.howItWorks.step2Description}
									</p>
									
									<div className="mb-4">
										<p className="font-medium mb-3">{t.landing.howItWorks.step2TellIvy}</p>
										<ul className="space-y-1 pl-4">
											{t.landing.howItWorks.step2List.map((item, index) => (
												<li key={index}>• {item}</li>
											))}
										</ul>
									</div>
									
									<div>
										<p className="font-medium mb-3">{t.landing.howItWorks.step2Analysis}</p>
										<ul className="space-y-1 pl-4">
											{t.landing.howItWorks.step2Results.map((item, index) => (
												<li key={index}>{item}</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Comparison Table */}
			<section className="py-20 px-6 bg-notion-gray-50">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-notion-gray-700 text-center mb-16 font-dm-sans">
						{t.landing.comparison.title}
					</h2>
					<div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
						<table className="w-full">
							<thead className="bg-gradient-to-r from-notion-gray-700 to-notion-gray-600">
								<tr>
									<th className="px-10 py-8 text-left text-base font-bold text-white">
										{t.landing.comparison.withIvy}
									</th>
									<th className="px-10 py-8 text-left text-base font-bold text-white">
										{t.landing.comparison.ordinaryAI}
									</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-b border-gray-100 hover:bg-notion-gray-50 transition-colors duration-200">
									<td className="px-10 py-8 text-sm text-notion-gray-700 font-medium leading-relaxed">
										{t.landing.comparison.row1.ivy}
									</td>
									<td className="px-10 py-8 text-sm text-notion-gray-500 leading-relaxed">
										{t.landing.comparison.row1.ordinary}
									</td>
								</tr>
								<tr className="border-b border-gray-100 hover:bg-notion-gray-50 transition-colors duration-200">
									<td className="px-10 py-8 text-sm text-notion-gray-700 font-medium leading-relaxed">
										{t.landing.comparison.row2.ivy}
									</td>
									<td className="px-10 py-8 text-sm text-notion-gray-500 leading-relaxed">
										{t.landing.comparison.row2.ordinary}
									</td>
								</tr>
								<tr className="border-b border-gray-100 hover:bg-notion-gray-50 transition-colors duration-200">
									<td className="px-10 py-8 text-sm text-notion-gray-700 font-medium leading-relaxed">
										{t.landing.comparison.row3.ivy}
									</td>
									<td className="px-10 py-8 text-sm text-notion-gray-500 leading-relaxed">
										{t.landing.comparison.row3.ordinary}
									</td>
								</tr>
								<tr className="hover:bg-notion-gray-50 transition-colors duration-200">
									<td className="px-10 py-8 text-sm text-notion-gray-700 font-medium leading-relaxed">
										{t.landing.comparison.row4.ivy}
									</td>
									<td className="px-10 py-8 text-sm text-notion-gray-500 leading-relaxed">
										{t.landing.comparison.row4.ordinary}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section className="py-24 px-6 bg-white">
				<div className="max-w-4xl mx-auto text-center">
					{/* Enhanced Header */}
					<div className="mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-notion-gray-700 mb-6">
							{t.landing.pricing.title}
						</h2>
						<p className="text-lg text-notion-gray-500 mb-12">
							{t.landing.pricing.description}
						</p>
					</div>

					{/* Enhanced Pricing Card */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-lg p-10 mb-8 max-w-2xl mx-auto">
						{/* Pricing Display */}
						<div className="mb-10">
							<div className="inline-flex items-baseline mb-4">
								<span className="text-5xl md:text-6xl font-bold text-notion-gray-800">990</span>
								<span className="text-2xl text-notion-gray-600 ml-2">₽</span>
								<span className="text-lg text-notion-gray-500 ml-2">{t.landing.pricing.monthly}</span>
							</div>
							<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
								<p className="text-lg font-semibold text-green-800">
									{t.landing.pricing.trial}
								</p>
							</div>
						</div>

						{/* Features List */}
						<div className="mb-10">
							<p className="text-lg font-semibold text-notion-gray-700 mb-6">
								{t.landing.pricing.unlimitedAccess}
							</p>
							<div className="space-y-4 text-left">
								{t.landing.pricing.featuresList.map((feature, index) => (
									<div key={index} className="flex items-center gap-3">
										<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
											<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
										</svg>
										<span className="text-notion-gray-700">{feature}</span>
									</div>
								))}
							</div>
						</div>

						{/* Enhanced Button */}
						<button
							onClick={handleStart}
							className="w-full px-10 py-4 text-lg font-semibold text-white bg-notion-gray-700 hover:bg-notion-gray-600 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-notion-gray-200"
						>
							{t.landing.pricing.startButton}
						</button>
					</div>

					{/* Additional Info */}
					<p className="text-sm text-notion-gray-500">
						{t.landing.pricing.cancelAnytime}
					</p>
				</div>
			</section>

			{/* Who Is This For */}
			<section className="py-24 px-6 bg-notion-gray-50">
				<div className="max-w-6xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-notion-gray-700 text-center mb-20">
						{t.landing.forYou.title}
					</h2>
					
					{/* Card-Based Design */}
					<div className="grid md:grid-cols-2 gap-8">
						{/* For You Card */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-lg p-10 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
							<div className="mb-10">
								<h3 className="text-2xl font-bold text-notion-gray-700">
									{t.landing.forYou.subtitle}
								</h3>
							</div>
							<div className="space-y-6">
								<div className="flex items-start gap-4">
									<svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<p className="text-xl text-notion-gray-600 leading-relaxed">{t.landing.forYou.yes1}</p>
								</div>
								<div className="flex items-start gap-4">
									<svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<p className="text-xl text-notion-gray-600 leading-relaxed">{t.landing.forYou.yes2}</p>
								</div>
								<div className="flex items-start gap-4">
									<svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<p className="text-xl text-notion-gray-600 leading-relaxed">{t.landing.forYou.yes3}</p>
								</div>
								<div className="flex items-start gap-4">
									<svg className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
									</svg>
									<p className="text-xl text-notion-gray-600 leading-relaxed">{t.landing.forYou.yes4}</p>
								</div>
							</div>
						</div>

						{/* Not For You Card */}
						<div className="bg-white rounded-xl border border-gray-200 shadow-lg p-10 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
							<div className="mb-10">
								<h3 className="text-2xl font-bold text-notion-gray-700">
									{t.landing.forYou.subtitleNo}
								</h3>
							</div>
							<div className="space-y-6 mb-10">
								<div className="flex items-start gap-4">
									<svg className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
									</svg>
									<p className="text-xl text-notion-gray-600 leading-relaxed">{t.landing.forYou.no1}</p>
								</div>
								<div className="flex items-start gap-4">
									<svg className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
										<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
									</svg>
									<p className="text-xl text-notion-gray-600 leading-relaxed">{t.landing.forYou.no2}</p>
								</div>
							</div>
							<div className="bg-notion-gray-50 rounded-lg p-8 border border-gray-200">
								<p className="text-lg text-notion-gray-600 italic leading-relaxed">{t.landing.forYou.note}</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="py-20 px-6">
				<div className="max-w-3xl mx-auto">
					<h2 className="text-3xl md:text-4xl font-bold text-notion-gray-700 text-center mb-16 font-dm-sans">
						{t.landing.faq.title}
					</h2>
					<div className="space-y-3">
						{[
							{ q: t.landing.faq.q1.question, a: t.landing.faq.q1.answer },
							{ q: t.landing.faq.q2.question, a: t.landing.faq.q2.answer },
							{ q: t.landing.faq.q3.question, a: t.landing.faq.q3.answer },
							{ q: t.landing.faq.q4.question, a: t.landing.faq.q4.answer },
							{ q: t.landing.faq.q5.question, a: t.landing.faq.q5.answer }
						].map((faq, index) => (
							<div key={index} className="bg-white rounded-lg border border-gray-100 overflow-hidden">
								<button
									onClick={() => toggleFAQ(index)}
									className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-notion-gray-50 transition-colors"
								>
									<h3 className="text-base font-medium text-notion-gray-700 pr-4">
										{faq.q}
									</h3>
									<svg
										className={`w-5 h-5 text-notion-gray-500 transform transition-transform ${
											openFAQ === index ? 'rotate-180' : ''
										}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{openFAQ === index && (
									<div className="px-6 pb-4 border-t border-gray-100">
										<p className="text-notion-gray-600 pt-4 leading-relaxed">
											{faq.a}
										</p>
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-notion-gray-50 border-t border-gray-100 py-12 px-6">
				<div className="max-w-7xl mx-auto">
					<div className="grid md:grid-cols-3 gap-8 mb-8">
						<div>
							<h4 className="text-sm font-semibold text-notion-gray-700 mb-4">
								{t.landing.footer.legal}
							</h4>
							<div className="space-y-2">
								<a
									href="/privacy-policy"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-block text-sm text-notion-gray-500 hover:text-notion-gray-700 transition-colors border border-gray-200 rounded-md px-3 py-2 hover:border-gray-300 hover:bg-gray-50 w-fit"
								>
									{t.landing.footer.userAgreement}
								</a>
								<br />
								<a
									href="/public-offer"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-block text-sm text-notion-gray-500 hover:text-notion-gray-700 transition-colors border border-gray-200 rounded-md px-3 py-2 hover:border-gray-300 hover:bg-gray-50 w-fit"
								>
									{t.landing.footer.publicOffer}
								</a>
							</div>
						</div>
						<div>
							<h4 className="text-sm font-semibold text-notion-gray-700 mb-4">
								{t.landing.footer.support}
							</h4>
							<div className="space-y-2">
								<a
									href="/contact"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-block text-sm text-notion-gray-500 hover:text-notion-gray-700 transition-colors border border-gray-200 rounded-md px-3 py-2 hover:border-gray-300 hover:bg-gray-50 w-fit"
								>
									{t.landing.footer.contacts}
								</a>
							</div>
						</div>
						<div>
							<h4 className="text-sm font-semibold text-notion-gray-700 mb-4">
								{t.landing.footer.features}
							</h4>
							<div className="space-y-2">
								<p className="text-sm text-notion-gray-500">{t.landing.footer.aiEssayAnalysis}</p>
								<p className="text-sm text-notion-gray-500">{t.landing.footer.universityMatching}</p>
								<p className="text-sm text-notion-gray-500">{t.landing.footer.chatSupport}</p>
							</div>
						</div>
					</div>
					<div className="border-t border-gray-200 pt-8 text-center">
						<p className="text-sm text-notion-gray-500">{t.landing.footer.copyright}</p>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;

