import React, { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useForm } from "react-hook-form";

const isStrongPassword = (password: string) => {
	const lengthOk = password.length >= 8;
	const hasLower = /[a-z]/.test(password);
	const hasUpper = /[A-Z]/.test(password);
	const hasDigit = /\d/.test(password);
	const hasSpecial = /[^A-Za-z0-9]/.test(password);
	return lengthOk && hasLower && hasUpper && hasDigit && hasSpecial;
};

type RegisterFormValues = { email: string; password: string; agreed: boolean };

const DEFAULT_VALUES: RegisterFormValues = { email: "", password: "", agreed: false };

const RegisterPage: React.FC = () => {
	const navigate = useNavigate();
	const { signup } = useAuth();

	const {
		register,
		handleSubmit,
		reset,
		watch,
		setError,
		formState: { errors, isSubmitting, isValid },
	} = useForm<RegisterFormValues>({
		mode: "onSubmit",
		defaultValues: DEFAULT_VALUES,
	});

	const passwordValue = watch("password");

	const passwordHint = useMemo(() => {
		const items = [] as string[];
		if (!passwordValue || passwordValue.length < 8) items.push("минимум 8 символов");
		if (!/[a-z]/.test(passwordValue || "")) items.push("строчные буквы");
		if (!/[A-Z]/.test(passwordValue || "")) items.push("заглавные буквы");
		if (!/\d/.test(passwordValue || "")) items.push("цифры");
		if (!/[^A-Za-z0-9]/.test(passwordValue || "")) items.push("спецсимволы");
		return items;
	}, [passwordValue]);

	const onSubmit = async (values: RegisterFormValues) => {
		try {
			await signup({ email: values.email, password: values.password });
			navigate("/registration-success", { replace: true });
		} catch (err: any) {
			setError("root.serverError", {
				type: "server",
				message: err?.response?.data?.message || "Не удалось создать аккаунт",
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
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Создать аккаунт</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Уже есть аккаунт?{" "}
						<Link
							to="/login"
							className="font-semibold text-harvard-crimson hover:text-red-800 text-lg"
						>
							Войти
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
							{...register("password", {
								required: "Введите пароль",
								validate: (v) => (isStrongPassword(v) ? true : "Пароль недостаточно сложный"),
							})}
							autoComplete="new-password"
							className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
							placeholder="Пароль"
						/>
						{passwordValue && passwordValue.length > 0 && !isStrongPassword(passwordValue) && (
							<div className="text-gray-600 text-xs mt-1">
								Пароль должен содержать: {passwordHint.join(", ")}
							</div>
						)}
						{errors.password && (
							<div className="text-red-500 text-xs mt-1">{errors.password.message}</div>
						)}
					</div>

					<div style={{ margin: "16px 0" }}>
						<label style={{ display: "flex", alignItems: "center", fontSize: 15 }}>
							<input
								type="checkbox"
								{...register("agreed", { required: "Подтвердите согласие" })}
								style={{ marginRight: 8 }}
							/>
							<Link
								to="/user-agreement"
								target="_blank"
								className="text-gray-600 hover:text-gray-800 underline"
							>
								Я принимаю Пользовательское соглашение
							</Link>
						</label>
						{errors.agreed && (
							<div className="text-red-500 text-xs mt-1">{errors.agreed.message as string}</div>
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
							{isSubmitting ? "Создание аккаунта..." : "Зарегистрироваться"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RegisterPage;
