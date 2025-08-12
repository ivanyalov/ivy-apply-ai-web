import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";

const RegistrationSuccessPage: React.FC = () => {
	const navigate = useNavigate();
	const { user } = useAuth();

	const handleContinue = () => {
		navigate("/access");
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">Регистрация завершена!</h2>
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
						<h3 className="mt-4 text-lg font-medium text-gray-900">Аккаунт успешно создан!</h3>
						<div className="mt-4 space-y-3 text-sm text-gray-600">
							<p>
								На ваш email <strong>{user?.email}</strong> отправлено письмо с подтверждением.
							</p>
							<p>
								Пожалуйста, проверьте почту и перейдите по ссылке в письме для подтверждения вашего
								email адреса.
							</p>
							<div className="bg-blue-50 p-3 rounded border border-blue-200">
								<p className="text-blue-800 text-xs">
									<strong>Важно:</strong> Для активации пробного периода или оформления подписки
									необходимо подтвердить email.
								</p>
							</div>
						</div>
						<div className="mt-6 space-y-3">
							<button
								onClick={handleContinue}
								className="w-full bg-harvard-crimson text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
							>
								Продолжить к выбору плана
							</button>
							<div className="text-xs text-gray-500">
								Не получили письмо? Проверьте папку спам или перейдите на страницу выбора плана для
								повторной отправки.
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
