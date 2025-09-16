import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../shared/hooks/useAuth";
import { useTranslation } from "../shared/hooks/useTranslation";
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
	const { t, language } = useTranslation();
	const [lastErrorType, setLastErrorType] = useState<"409" | "other" | null>(null);

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
		if (!passwordValue || passwordValue.length < 8) items.push(t.auth.register.minLength);
		if (!/[a-z]/.test(passwordValue || "")) items.push(t.auth.register.lowercase);
		if (!/[A-Z]/.test(passwordValue || "")) items.push(t.auth.register.uppercase);
		if (!/\d/.test(passwordValue || "")) items.push(t.auth.register.digits);
		if (!/[^A-Za-z0-9]/.test(passwordValue || "")) items.push(t.auth.register.special);
		return items;
	}, [passwordValue, t]);

	const onSubmit = async (values: RegisterFormValues) => {
		try {
			setLastErrorType(null); // Сбрасываем тип ошибки при новой попытке
			await signup({ email: values.email, password: values.password });
			navigate("/registration-success", { replace: true });
		} catch (err: any) {
			// Проверяем, является ли ошибка связанной с существующим аккаунтом (код 409)
			if (err?.response?.status === 409) {
				setLastErrorType("409");
				setError("root.serverError", {
					type: "server",
					message: t.auth.register.accountExists,
				});
			} else {
				setLastErrorType("other");
				setError("root.serverError", {
					type: "server",
					message: err?.response?.data?.message || "Failed to create account",
				});
			}
		}
	};

	useEffect(() => {
		reset(DEFAULT_VALUES);
		setLastErrorType(null); // Сбрасываем тип ошибки при сбросе формы
	}, [reset]);

	// Обновляем сообщение об ошибке при изменении языка
	useEffect(() => {
		if (lastErrorType === "409" && errors.root?.serverError) {
			setError("root.serverError", {
				type: "server",
				message: t.auth.register.accountExists,
			});
		}
	}, [language, lastErrorType, t.auth.register.accountExists, setError, errors.root?.serverError]);

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-lg">
					<div>
						<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
							{t.auth.register.title}
						</h2>
						<p className="mt-2 text-center text-sm text-gray-600">
							{t.auth.register.haveAccount}{" "}
							<Link
								to="/login"
								className="font-semibold bg-gradient-to-r from-harvard-crimson to-red-600 bg-clip-text text-transparent hover:from-red-700 hover:to-red-800 text-lg transition-all duration-300"
							>
								{t.auth.register.loginLink}
							</Link>
						</p>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
						<div>
							<label htmlFor="email" className="sr-only">
								{t.auth.register.email}
							</label>
							<input
								id="email"
								type="email"
								{...register("email", {
									required: t.auth.register.emailRequired,
									pattern: {
										value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
										message: t.auth.register.emailInvalid,
									},
								})}
								autoComplete="username"
								className="relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-gradient-to-r focus:ring-from-harvard-crimson focus:ring-to-red-600 focus:border-gradient-to-r focus:border-from-harvard-crimson focus:border-to-red-600 focus:z-10 sm:text-sm shadow-md"
								placeholder={t.auth.register.email}
							/>
							{errors.email && (
								<div className="text-red-600 text-xs mt-1">{errors.email.message}</div>
							)}
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								{t.auth.register.password}
							</label>
							<input
								id="password"
								type="password"
								{...register("password", {
									required: t.auth.register.passwordRequired,
									validate: (v) => (isStrongPassword(v) ? true : t.auth.register.passwordWeak),
								})}
								autoComplete="new-password"
								className="relative block w-full px-4 py-3 border-2 border-gray-200 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-1 focus:ring-gradient-to-r focus:ring-from-harvard-crimson focus:ring-to-red-600 focus:border-gradient-to-r focus:border-from-harvard-crimson focus:border-to-red-600 focus:z-10 sm:text-sm shadow-md"
								placeholder={t.auth.register.password}
							/>
							{passwordValue && passwordValue.length > 0 && !isStrongPassword(passwordValue) && (
								<div className="text-gray-600 text-xs mt-1">
									{t.auth.register.passwordRequirements} {passwordHint.join(", ")}
								</div>
							)}
							{errors.password && (
								<div className="text-red-600 text-xs mt-1">{errors.password.message}</div>
							)}
						</div>

						<div style={{ margin: "16px 0" }}>
							<label style={{ display: "flex", alignItems: "center", fontSize: 15 }}>
								<input
									type="checkbox"
									{...register("agreed", { required: t.auth.register.agreementRequired })}
									style={{ marginRight: 8 }}
								/>
								<span className="text-gray-600">
									{t.auth.register.agreeToTerms}{" "}
									<Link
										to="/privacy-policy"
										target="_blank"
										className="text-gray-600 hover:text-gray-800 underline"
									>
										{t.auth.register.userAgreement}
									</Link>{" "}
									{t.auth.register.and}{" "}
									<Link
										to="/public-offer"
										target="_blank"
										className="text-gray-600 hover:text-gray-800 underline"
									>
										{t.auth.register.publicOffer}
									</Link>
								</span>
							</label>
							{errors.agreed && (
								<div className="text-red-500 text-xs mt-1">{errors.agreed.message as string}</div>
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
								{isSubmitting
									? `${t.auth.register.registerButton}...`
									: t.auth.register.registerButton}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;
