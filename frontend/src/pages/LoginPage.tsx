import React, { useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useForm } from "react-hook-form";

type LoginFormValues = { email: string; password: string };

const DEFAULT_VALUES: LoginFormValues = { email: "", password: "" };

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { signin } = useAuth();
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
				message: err?.response?.data?.message || "Не удалось войти",
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
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Войти в аккаунт</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Нет аккаунта?{" "}
						<Link
							to="/register"
							className="font-semibold text-harvard-crimson hover:text-red-800 text-lg"
						>
							Зарегистрироваться
						</Link>
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
					<div>
						<label htmlFor="email" className="sr-only">
							Адрес электронной почты
						</label>
						<input
							id="email"
							type="email"
							{...register("email", {
								required: "Введите email",
								pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Некорректный email" },
							})}
							autoComplete="username"
							className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
							placeholder="Адрес электронной почты"
						/>
						{errors.email && (
							<div className="text-red-500 text-xs mt-1">{errors.email.message}</div>
						)}
					</div>
					<div>
						<label htmlFor="password" className="sr-only">
							Пароль
						</label>
						<input
							id="password"
							type="password"
							{...register("password", { required: "Введите пароль" })}
							autoComplete="new-password"
							className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
							placeholder="Пароль"
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
							{isSubmitting ? "Вход..." : "Войти"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default LoginPage;
