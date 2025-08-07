import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useSubscription } from "../shared/hooks/useSubscription";

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
			navigate("/auth");
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
					<h1 className="text-5xl font-bold text-gray-900 mb-6">Ivy Apply AI</h1>
					<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
						Ivy Apply AI — ваш персональный AI-консультант по поступлению в вузы. Загружайте
						документы, задавайте вопросы и получайте чёткие рекомендации на русском языке.
					</p>
					<div className="w-60 mx-auto">
						<button
							onClick={handleStart}
							className="w-full bg-harvard-crimson text-white py-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
						>
							Начать Чат
						</button>
						<div className="mt-4">
							<button
								onClick={handleSubscription}
								className="w-full bg-white border border-gray-300 text-gray-900 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
							>
								Подписка
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
						<h2 className="text-3xl font-bold text-gray-900 text-center">Что он умеет</h2>
					</div>
					<ul className="list-disc list-inside text-lg text-gray-600 text-center space-y-2">
						<li>Анализирует эссе и анкеты</li>
						<li>Помогает выбрать университет</li>
						<li>Отвечает на вопросы в формате чата</li>
					</ul>
				</div>
			</section>

			{/* How It Works */}
			<section className="py-16 px-6 bg-white">
				<div className="max-w-4xl mx-auto">
					<h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Как это работает</h2>
					<div className="space-y-8">
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								1
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Регистрация и выбор плана
								</h3>
								<p className="text-gray-600">
									Создайте аккаунт и выберите бесплатную пробную версию или подписку.
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								2
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Загрузка документов и вопросы
								</h3>
								<p className="text-gray-600">
									Поделитесь своими эссе, транскриптами или задайте вопросы о подаче документов.
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-6">
							<div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">
								3
							</div>
							<div>
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Получите персонализированную обратную связь
								</h3>
								<p className="text-gray-600">
									Получите мгновенное, подробное руководство, адаптированное к вашим конкретным
									потребностям.
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
						Часто задаваемые вопросы
					</h2>
					<div className="space-y-6">
						<div className="border-b border-gray-200 pb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Как работает AI-помощник?
							</h3>
							<p className="text-gray-600">
								Наш AI основан на передовых языковых моделях, специально обученных для
								консультирования по поступлению в университет. Он может анализировать документы,
								отвечать на вопросы и предоставлять персонализированные рекомендации.
							</p>
						</div>
						<div className="border-b border-gray-200 pb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Безопасны ли мои данные?</h3>
							<p className="text-gray-600">
								Да, мы серьезно относимся к безопасности данных. Все загруженные документы и
								переписка шифруются и надежно хранятся.
							</p>
						</div>
						<div className="border-b border-gray-200 pb-6">
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Какие типы документов я могу загрузить?
							</h3>
							<p className="text-gray-600">
								Вы можете загружать эссе, транскрипты, рекомендательные письма и другие документы,
								связанные с поступлением, в различных форматах.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-white text-gray-900 py-12 px-6">
				<div className="max-w-4xl mx-auto text-center">
					<h3 className="text-2xl font-bold mb-6">Ivy Apply AI</h3>
					<div className="flex justify-center space-x-8 mb-8">
						<a
							href="/user-agreement"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 hover:text-gray-700 transition-colors"
						>
							Пользовательское соглашение
						</a>
						<a
							href="/public-offer"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 hover:text-gray-700 transition-colors"
						>
							Публичная оферта
						</a>
						<a
							href="/contact"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 hover:text-gray-700 transition-colors"
						>
							Контакты
						</a>
					</div>
					<p className="text-gray-600">© 2025 Ivy Apply AI. Все права защищены.</p>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;
