import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "../shared/api/auth";
import { useAuth } from "../shared/hooks/useAuth";

const EmailVerificationPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user, signout } = useAuth();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [message, setMessage] = useState("");
	const [resendLoading, setResendLoading] = useState(false);
	const verificationAttemptedRef = useRef(false);

	const token = searchParams.get("token");

	// Отладочная информация
	console.log("🔍 EmailVerificationPage render:", {
		token,
		tokenLength: token?.length,
		tokenType: typeof token,
		status,
		verificationAttempted: verificationAttemptedRef.current,
		searchParams: Object.fromEntries(searchParams.entries()),
		url: window.location.href,
	});

	// Функция верификации
	const verifyEmail = async () => {
		console.log("🔍 verifyEmail called with token:", token);
		console.log("🔍 Token details:", {
			token,
			tokenLength: token?.length,
			tokenType: typeof token,
			isEmpty: !token,
			isEmptyString: token === "",
			isNull: token === null,
			isUndefined: token === undefined,
		});

		if (!token) {
			console.log("❌ No token found in URL");
			setStatus("error");
			setMessage("Отсутствует токен верификации");
			return;
		}

		if (token.trim() === "") {
			console.log("❌ Token is empty string");
			setStatus("error");
			setMessage("Токен верификации пустой");
			return;
		}

		// Дополнительная проверка через localStorage
		const verificationKey = `verification_attempted_${token}`;
		if (verificationAttemptedRef.current || localStorage.getItem(verificationKey)) {
			console.log("⚠️ Verification already attempted, skipping");
			return; // Предотвращаем повторные вызовы
		}

		console.log("✅ Starting verification process");
		verificationAttemptedRef.current = true;
		localStorage.setItem(verificationKey, "true");

		try {
			console.log("🔍 Starting email verification process with token:", token);

			const result = await authService.verifyEmail(token);

			console.log("✅ Verification successful:", result);
			setStatus("success");
			setMessage(result.message);

			try {
				queryClient.setQueryData(["auth", "user"], result.user);
			} catch (cacheError) {
				console.error("❌ Error updating cache:", cacheError);
			}

			const hasJwtToken = localStorage.getItem("token");
			if (hasJwtToken) {
				try {
					queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
				} catch (invalidateError) {
					console.error("❌ Error invalidating cache:", invalidateError);
				}
			} else {
				console.log("🔍 Skipping cache invalidation - user not authenticated with JWT");
			}

			console.log("✅ Email verification completed successfully");
		} catch (error: any) {
			console.error("❌ Verification error:", error);
			console.error("❌ Error response:", error.response);

			setStatus("error");

			if (error.response?.status === 404) {
				setMessage("Недействительная или истёкшая ссылка верификации");
			} else if (error.response?.status === 409) {
				// Если email уже подтверждён, это тоже успех
				setStatus("success");
				setMessage("Email уже подтверждён");

				// Обновляем данные пользователя
				try {
					const currentUser = await authService.getMe();
					queryClient.setQueryData(["auth", "user"], currentUser);
				} catch (meError) {
					console.error("Failed to get current user:", meError);
				}
			} else {
				setMessage(
					`Ошибка при подтверждении email (${error.response?.status || "неизвестная ошибка"}): ${
						error.response?.data?.error || error.message
					}`
				);
			}
		}
	};

	// Используем useEffect с правильной логикой
	useEffect(() => {
		if (token && status === "loading" && !verificationAttemptedRef.current) {
			console.log("🔍 useEffect: Triggering verification...");
			verifyEmail();
		}
	}, [token, status]); // Зависимости только от token и status

	const handleResendEmail = async () => {
		if (!user?.email) {
			setMessage("Не удалось определить email пользователя");
			return;
		}

		setResendLoading(true);
		try {
			await authService.resendVerificationEmail(user.email);
			setMessage("Письмо с подтверждением отправлено повторно");
		} catch (error: any) {
			if (error.response?.status === 409) {
				setMessage("Email уже подтверждён");
			} else {
				setMessage("Ошибка при отправке письма");
			}
		} finally {
			setResendLoading(false);
		}
	};

	const handleContinue = () => {
		// Если верификация прошла успешно, направляем на страницу логина
		// чтобы пользователь мог войти в систему с подтвержденным email
		if (status === "success") {
			navigate("/access");
		} else {
			navigate("/login");
		}
	};

	const handleLogout = () => {
		signout();
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">Подтверждение email</h2>
				</div>

				<div className="bg-white p-8 rounded-lg shadow-md">
					{status === "loading" && (
						<div className="text-center">
							<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvard-crimson mx-auto"></div>
							<p className="mt-4 text-gray-600">Подтверждение email...</p>
						</div>
					)}

					{status === "success" && (
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
							<h3 className="mt-4 text-lg font-medium text-gray-900">Email успешно подтверждён!</h3>
							<p className="mt-2 text-sm text-gray-600">{message}</p>
							<div className="mt-6">
								<button
									onClick={handleContinue}
									className="w-full bg-harvard-crimson text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
								>
									Продолжить
								</button>
							</div>
						</div>
					)}

					{status === "error" && (
						<div className="text-center">
							<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
								<svg
									className="h-6 w-6 text-red-600"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</div>
							<h3 className="mt-4 text-lg font-medium text-gray-900">Ошибка подтверждения</h3>
							<p className="mt-2 text-sm text-gray-600">{message}</p>

							{user && !user.email_verified && (
								<div className="mt-6 space-y-3">
									<button
										onClick={handleResendEmail}
										disabled={resendLoading}
										className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{resendLoading ? "Отправка..." : "Отправить повторно"}
									</button>
									<button
										onClick={handleLogout}
										className="w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
									>
										Выйти из аккаунта
									</button>
								</div>
							)}

							{!user && (
								<div className="mt-6 space-y-3">
									<Link
										to="/login"
										className="block w-full bg-harvard-crimson text-white py-3 px-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors text-center"
									>
										Войти в аккаунт
									</Link>
									<Link
										to="/register"
										className="block w-full bg-white border border-gray-300 text-gray-900 py-3 px-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors text-center"
									>
										Зарегистрироваться
									</Link>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default EmailVerificationPage;
