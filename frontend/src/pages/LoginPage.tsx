import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useTranslation } from "../shared/hooks/useTranslation";
import { useLanguage } from "../shared/hooks/useLanguage";
import { useSubscription } from "../shared/hooks/useSubscription";
import { useForm } from "react-hook-form";

type LoginFormValues = { email: string; password: string };

const DEFAULT_VALUES: LoginFormValues = { email: "", password: "" };

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { signin } = useAuth();
	const { t } = useTranslation();
	const { language, toggleLanguage } = useLanguage();
	const { subscription } = useSubscription();
	const [showPassword, setShowPassword] = useState(false);
	const from = (location.state as any)?.from?.pathname || "/access";

	const {
		register,
		handleSubmit,
		reset,
		setError,
		formState: { errors, isSubmitting, isValid },
	} = useForm<LoginFormValues>({ mode: "onSubmit", defaultValues: DEFAULT_VALUES });

	const onSubmit = async (values: LoginFormValues) => {
		try {
			await signin(values);
			navigate(from, { replace: true });
		} catch (err: any) {
			setError("root.serverError", {
				type: "server",
				message: err?.response?.data?.message || t.auth.login.loginError,
			});
		}
	};

	useEffect(() => {
		reset(DEFAULT_VALUES);
	}, [reset]);

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
						<div>
							<h2 className="text-3xl font-bold text-notion-gray-700 text-center mb-6 font-dm-sans">{t.auth.login.title}</h2>
							<p className="text-center text-notion-gray-700 mb-8">
								{t.auth.login.noAccount}{" "}
								<Link
									to="/register"
									className="font-medium text-notion-gray-700 hover:text-notion-gray-600 underline transition-colors"
								>
									{t.auth.login.registerLink}
								</Link>
							</p>
						</div>
						<form className="space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
							<div>
								<label htmlFor="email" className="sr-only">
									{t.auth.login.email}
								</label>
								<input
									id="email"
									type="email"
									{...register("email", {
										required: t.auth.register.emailRequired,
										pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.auth.register.emailInvalid },
									})}
									autoComplete="username"
									className="relative block w-full px-4 py-3 border border-gray-200 placeholder-notion-gray-600 text-notion-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-notion-gray-700 focus:border-notion-gray-700 sm:text-sm"
									placeholder={t.auth.login.email}
								/>
								{errors.email && (
									<div className="text-red-600 text-sm mt-2">{errors.email.message}</div>
								)}
							</div>
							<div>
								<label htmlFor="password" className="sr-only">
									{t.auth.login.password}
								</label>
								<div className="relative">
									<input
										id="password"
										type={showPassword ? "text" : "password"}
										{...register("password", { required: t.auth.register.passwordRequired })}
										autoComplete="new-password"
										className="relative block w-full px-4 py-3 pr-12 border border-gray-200 placeholder-notion-gray-600 text-notion-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-notion-gray-700 focus:border-notion-gray-700 sm:text-sm"
										placeholder={t.auth.login.password}
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-notion-gray-600 hover:text-notion-gray-700 transition-colors"
									>
										{showPassword ? (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
											</svg>
										) : (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
										)}
									</button>
								</div>
								{errors.password && (
									<div className="text-red-600 text-sm mt-2">{errors.password.message}</div>
								)}
							</div>

							{errors.root?.serverError?.message && (
								<div className="bg-red-50 border border-red-200 text-red-700 text-sm text-center p-4 rounded-lg">
									{errors.root.serverError.message}
								</div>
							)}

							<div>
								<button
									type="submit"
									disabled={isSubmitting || !isValid}
									className="w-full bg-notion-gray-700 text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-notion-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
								>
									{isSubmitting ? `${t.auth.login.loginButton}...` : t.auth.login.loginButton}
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
