import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useTranslation } from "../shared/hooks/useTranslation";

const RegistrationSuccessPage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { t } = useTranslation();

	const handleContinue = () => {
		navigate("/access");
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
					<div className="text-center">
						<h2 className="mt-6 text-3xl font-bold text-gray-900">{t.registrationSuccess.title}</h2>
					</div>

					<div className="text-center mt-8">
						<div className="mx-auto flex items-center justify-center h-16 w-16 rounded-xl bg-green-50 border-2 border-green-200 shadow-md">
							<svg
								className="h-8 w-8 text-green-600"
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
						<h3 className="mt-6 text-xl font-semibold text-gray-900">{t.registrationSuccess.accountCreated}</h3>
						<div className="mt-6 space-y-4 text-sm text-gray-700">
							<p>
								{t.registrationSuccess.emailSent} <strong className="text-gray-900">{user?.email}</strong>{t.registrationSuccess.confirmationSent && ` ${t.registrationSuccess.confirmationSent}`}
							</p>
							<p>
								{t.registrationSuccess.checkEmail}
							</p>
							<div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
								<p className="text-blue-800 text-sm">
									<strong>{t.registrationSuccess.importantNote}</strong> {t.registrationSuccess.emailRequired}
								</p>
							</div>
						</div>
						<div className="mt-8 space-y-4">
							<button
								onClick={handleContinue}
								className="w-full bg-gradient-to-r from-harvard-crimson to-red-600 text-white py-3 px-4 border-2 border-gradient-to-r border-from-red-700 border-to-red-800 rounded-xl text-lg font-semibold hover:from-red-700 hover:to-red-800 hover:border-gradient-to-r hover:border-from-red-700 hover:border-to-red-800 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
							>
								{t.registrationSuccess.continueButton}
							</button>
							<div className="text-xs text-gray-500">
								{t.registrationSuccess.noEmailReceived}
							</div>
						</div>
					</div>
				</div>

				{/* Убрана ссылка возврата на главную по требованию */}
			</div>
		</div>
	);
};

export default RegistrationSuccessPage;
