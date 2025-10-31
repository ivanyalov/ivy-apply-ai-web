import React, { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { authService } from "../shared/api/auth";
import { useAuth } from "../shared/hooks/useAuth";
import { useTranslation } from "../shared/hooks/useTranslation";
import { useLanguage } from "../shared/hooks/useLanguage";
import { useSubscription } from "../shared/hooks/useSubscription";

const EmailVerificationPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { user, signout } = useAuth();
	const { t } = useTranslation();
	const { language, toggleLanguage } = useLanguage();
	const { subscription } = useSubscription();
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
			setMessage(t.emailVerification.noToken);
			return;
		}

		if (token.trim() === "") {
			console.log("❌ Token is empty string");
			setStatus("error");
			setMessage(t.emailVerification.emptyToken);
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
				setMessage(t.emailVerification.invalidLink);
			} else if (error.response?.status === 409) {
				// Если email уже подтверждён, это тоже успех
				setStatus("success");
				setMessage(t.emailVerification.alreadyVerified);

				// Обновляем данные пользователя
				try {
					const currentUser = await authService.getMe();
					queryClient.setQueryData(["auth", "user"], currentUser);
				} catch (meError) {
					console.error("Failed to get current user:", meError);
				}
			} else {
				setMessage(
					`${t.emailVerification.verificationError} (${error.response?.status || "unknown error"}): ${
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
			setMessage(t.emailVerification.emailNotFound);
			return;
		}

		setResendLoading(true);
		try {
			await authService.resendVerificationEmail(user.email);
			setMessage(t.emailVerification.resendSuccess);
		} catch (error: any) {
			if (error.response?.status === 409) {
				setMessage(t.emailVerification.alreadyVerified);
			} else {
				setMessage(t.emailVerification.resendError);
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
				<div className="w-full px-6 py-3 flex justify-between items-center">
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
						<div className="text-center">
							<h2 className="text-3xl font-bold text-notion-gray-700 mb-6 font-dm-sans">{t.emailVerification.title}</h2>
						</div>
						{status === "loading" && (
							<div className="text-center">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-gray-700 mx-auto"></div>
								<p className="mt-4 text-notion-gray-600">{t.emailVerification.verifying}</p>
							</div>
						)}

						{status === "success" && (
							<div className="text-center">
								<div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-xl mb-6">
									<svg
										className="w-8 h-8 text-green-600"
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
								<h3 className="text-xl font-semibold text-notion-gray-700 mb-8 font-dm-sans">{t.emailVerification.successTitle}</h3>
								<div>
									<button
										onClick={handleContinue}
										className="w-full bg-notion-gray-700 text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-notion-gray-600 transition-all duration-300"
									>
										{t.emailVerification.continueButton}
									</button>
								</div>
							</div>
						)}

						{status === "error" && (
							<div className="text-center">
								<div className="mx-auto flex items-center justify-center w-16 h-16 bg-red-100 rounded-xl mb-6">
									<svg
										className="w-8 h-8 text-red-600"
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
								<h3 className="text-xl font-semibold text-notion-gray-700 mb-4 font-dm-sans">{t.emailVerification.errorTitle}</h3>
								<p className="text-sm text-notion-gray-600 mb-8">{message}</p>

								{user && !user.email_verified && (
									<div className="space-y-3">
										<button
											onClick={handleResendEmail}
											disabled={resendLoading}
											className="w-full bg-amber-500/90 text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-amber-600/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
										>
											{resendLoading ? t.emailVerification.resendingButton : t.emailVerification.resendButton}
										</button>
										<button
											onClick={handleLogout}
											className="w-full bg-notion-gray-700 text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-notion-gray-600 transition-all duration-300"
										>
											{t.emailVerification.logoutButton}
										</button>
									</div>
								)}

								{!user && (
									<div className="space-y-3">
										<Link
											to="/login"
											className="block w-full bg-notion-gray-700 text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-notion-gray-600 transition-all duration-300 text-center"
										>
											{t.emailVerification.loginButton}
										</Link>
										<Link
											to="/register"
											className="block w-full bg-notion-gray-700 text-white py-3 px-4 rounded-lg text-base font-medium hover:bg-notion-gray-600 transition-all duration-300 text-center"
										>
											{t.emailVerification.registerButton}
										</Link>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmailVerificationPage;
