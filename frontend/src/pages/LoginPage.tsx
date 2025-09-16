import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useTranslation } from "../shared/hooks/useTranslation";
import { useForm } from "react-hook-form";

type LoginFormValues = { email: string; password: string };

const DEFAULT_VALUES: LoginFormValues = { email: "", password: "" };

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { signin } = useAuth();
	const { t } = useTranslation();
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

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
					<div>
						<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">{t.auth.login.title}</h2>
						<p className="mt-2 text-center text-sm text-gray-600">
							{t.auth.login.noAccount}{" "}
							<Link
								to="/register"
								className="font-semibold bg-gradient-to-r from-harvard-crimson to-red-600 bg-clip-text text-transparent hover:from-red-700 hover:to-red-800 text-lg transition-all duration-300"
							>
								{t.auth.login.registerLink}
							</Link>
						</p>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
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
								className="relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-gradient-to-r focus:ring-from-harvard-crimson focus:ring-to-red-600 focus:border-gradient-to-r focus:border-from-harvard-crimson focus:border-to-red-600 focus:z-10 sm:text-sm shadow-md"
								placeholder={t.auth.login.email}
							/>
							{errors.email && (
								<div className="text-red-600 text-xs mt-1">{errors.email.message}</div>
							)}
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								{t.auth.login.password}
							</label>
							<input
								id="password"
								type="password"
								{...register("password", { required: t.auth.register.passwordRequired })}
								autoComplete="new-password"
								className="relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-gradient-to-r focus:ring-from-harvard-crimson focus:ring-to-red-600 focus:border-gradient-to-r focus:border-from-harvard-crimson focus:border-to-red-600 focus:z-10 sm:text-sm shadow-md"
								placeholder={t.auth.login.password}
							/>
							{errors.password && (
								<div className="text-red-600 text-xs mt-1">{errors.password.message}</div>
							)}
						</div>

						{errors.root?.serverError?.message && (
							<div className="bg-red-50 border-2 border-red-200 text-red-700 text-sm text-center p-3 rounded-xl">
								{errors.root.serverError.message}
							</div>
						)}

						<div>
							<button
								type="submit"
								disabled={isSubmitting || !isValid}
								className="group relative w-full flex justify-center py-3 px-4 border-2 border-gradient-to-r border-from-harvard-crimson border-to-red-600 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-harvard-crimson to-red-600 hover:from-red-700 hover:to-red-800 hover:border-gradient-to-r hover:border-from-red-700 hover:border-to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gradient-to-r focus:ring-from-harvard-crimson focus:ring-to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
							>
								{isSubmitting ? `${t.auth.login.loginButton}...` : t.auth.login.loginButton}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
