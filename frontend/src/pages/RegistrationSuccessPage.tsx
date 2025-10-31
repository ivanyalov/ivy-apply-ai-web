import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useTranslation } from "../shared/hooks/useTranslation";
import { useLanguage } from "../shared/hooks/useLanguage";
import { useSubscription } from "../shared/hooks/useSubscription";

const RegistrationSuccessPage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { t } = useTranslation();
	const { language, toggleLanguage } = useLanguage();
	const { subscription } = useSubscription();

	const handleContinue = () => {
		navigate("/access");
	};

	const handleStart = () => {
		if (subscription?.hasAccess) {
			navigate('/chat');
		} else {
			navigate('/access');
		}
	};

	const handleSubscription = () => {
		navigate('/access');
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
							{t.landing.hero.startButton}
						</button>
					</div>
				</div>
			</nav>

			<div className="flex items-center justify-center min-h-screen pt-20 pb-20 px-6">
				<div className="max-w-md w-full">
					<div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all duration-300">
						<div className="text-center">
							<div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
								<svg
									className="w-8 h-8 text-green-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<h2 className="text-3xl font-bold text-notion-gray-700 mb-6 font-dm-sans">{t.registrationSuccess.title}</h2>
							<h3 className="text-xl font-semibold text-notion-gray-700 mb-8 font-dm-sans">{t.registrationSuccess.accountCreated}</h3>
						</div>
						<div className="space-y-4 text-sm text-notion-gray-700 mb-8 text-center">
							<p>
								{t.registrationSuccess.emailSent} <strong className="text-notion-gray-700">{user?.email}</strong>{t.registrationSuccess.confirmationSent && ` ${t.registrationSuccess.confirmationSent}`}
							</p>
							<p>
								{t.registrationSuccess.checkEmail}
							</p>
							<div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
								<p className="text-blue-800 text-sm">
									<strong>{t.registrationSuccess.importantNote}</strong> {t.registrationSuccess.emailRequired}
								</p>
							</div>
						</div>
						<div className="space-y-4">
							<button
								onClick={handleContinue}
								className="w-full bg-notion-gray-700 text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-notion-gray-600 transition-all duration-300"
							>
								{t.registrationSuccess.continueButton}
							</button>
							<div className="text-xs text-notion-gray-600 text-center">
								{t.registrationSuccess.noEmailReceived}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegistrationSuccessPage;
