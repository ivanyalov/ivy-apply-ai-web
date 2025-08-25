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
				<div>
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">{t.auth.login.title}</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						{t.auth.login.noAccount}{" "}
						<Link
							to="/register"
							className="font-semibold text-harvard-crimson hover:text-red-800 text-lg"
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
							className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
							placeholder={t.auth.login.email}
						/>
						{errors.email && (
							<div className="text-red-500 text-xs mt-1">{errors.email.message}</div>
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
							className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
							placeholder={t.auth.login.password}
						/>
						{errors.password && (
							<div className="text-red-500 text-xs mt-1">{errors.password.message}</div>
						)}
					</div>

					{errors.root?.serverError?.message && (
						<div className="text-red-500 text-sm text-center">
							{errors.root.serverError.message}
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={isSubmitting || !isValid}
							className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-lg text-white bg-harvard-crimson hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvard-crimson disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? `${t.auth.login.loginButton}...` : t.auth.login.loginButton}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
