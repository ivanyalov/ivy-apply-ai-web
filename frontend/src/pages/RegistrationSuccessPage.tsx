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
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">{t.registrationSuccess.title}</h2>
				</div>

				<div className="bg-white p-8 rounded-lg shadow-md">
					<div className="text-center">
						<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
							<svg
								className="h-6 w-6 text-green-600"
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
						<h3 className="mt-4 text-lg font-medium text-gray-900">{t.registrationSuccess.accountCreated}</h3>
						<div className="mt-4 space-y-3 text-sm text-gray-600">
							<p>
								{t.registrationSuccess.emailSent} <strong>{user?.email}</strong>{t.registrationSuccess.confirmationSent && ` ${t.registrationSuccess.confirmationSent}`}
							</p>
							<p>
								{t.registrationSuccess.checkEmail}
							</p>
							<div className="bg-blue-50 p-3 rounded border border-blue-200">
								<p className="text-blue-800 text-xs">
									<strong>{t.registrationSuccess.importantNote}</strong> {t.registrationSuccess.emailRequired}
								</p>
							</div>
						</div>
						<div className="mt-6 space-y-3">
							<button
								onClick={handleContinue}
								className="w-full bg-harvard-crimson text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
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
