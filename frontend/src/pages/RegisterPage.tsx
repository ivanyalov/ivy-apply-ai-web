import React, { useEffect, useMemo } from "react";
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
	const { t } = useTranslation();

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
			await signup({ email: values.email, password: values.password });
			navigate("/registration-success", { replace: true });
		} catch (err: any) {
			setError("root.serverError", {
				type: "server",
				message: err?.response?.data?.message || "Failed to create account",
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
					<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">{t.auth.register.title}</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						{t.auth.register.haveAccount}{" "}
						<Link
							to="/login"
							className="font-semibold text-harvard-crimson hover:text-red-800 text-lg"
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
								pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t.auth.register.emailInvalid },
							})}
							autoComplete="username"
							className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
							placeholder={t.auth.register.email}
						/>
						{errors.email && (
							<div className="text-red-500 text-xs mt-1">{errors.email.message}</div>
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
							className="relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-harvard-crimson focus:border-harvard-crimson focus:z-10 sm:text-sm"
							placeholder={t.auth.register.password}
						/>
						{passwordValue && passwordValue.length > 0 && !isStrongPassword(passwordValue) && (
							<div className="text-gray-600 text-xs mt-1">
								{t.auth.register.passwordRequirements} {passwordHint.join(", ")}
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
								{...register("agreed", { required: t.auth.register.agreementRequired })}
								style={{ marginRight: 8 }}
							/>
							<span className="text-gray-600">
								{t.auth.register.agreeToTerms}{" "}
								<Link
									to="/user-agreement"
									target="_blank"
									className="text-gray-600 hover:text-gray-800 underline"
								>
									{t.auth.register.userAgreement}
								</Link>
								{" "}{t.auth.register.and}{" "}
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
							{isSubmitting ? `${t.auth.register.registerButton}...` : t.auth.register.registerButton}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default RegisterPage;
