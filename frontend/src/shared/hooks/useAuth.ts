import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { authService, AuthResponse, SignInCredentials, SignUpCredentials } from "../api/auth";

/**
 * @hook useAuth
 * @description Кастомный хук для управления аутентификацией с использованием TanStack Query.
 * Заменяет AuthContext и предоставляет методы для входа, регистрации и выхода.
 *
 * @returns {Object} Объект с данными и методами аутентификации.
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, signin, signup, signout, isLoading } = useAuth();
 *
 * if (isAuthenticated) {
 *   return <div>Добро пожаловать, {user?.email}!</div>;
 * }
 * ```
 */
export const useAuth = ({ meRefetch = false }: { meRefetch?: boolean } = {}) => {
	const queryClient = useQueryClient();

	// Query для получения данных пользователя
	const {
		data: user,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["auth", "user"],
		queryFn: async () => {
			const token = localStorage.getItem("token");
			if (!token) {
				return null;
			}
			return await authService.getMe();
		},
		refetchOnMount: meRefetch, // НЕ перезапрашиваем при монтировании, если есть свежие данные
	});

	// Автоматически очищаем данные подписки при потере аутентификации
	useEffect(() => {
		if (!user && !isLoading) {
			// Пользователь не аутентифицирован, очищаем данные подписки
			queryClient.setQueryData(["subscription", "status"], null);
			queryClient.removeQueries({ queryKey: ["subscription"] });
		}
	}, [user, isLoading, queryClient]);

	// Mutation для входа
	const signinMutation = useMutation({
		mutationFn: async (credentials: SignInCredentials) => {
			const response = await authService.signin(credentials);
			// Сразу получаем актуальные данные пользователя
			const currentUser = await authService.getMe();
			return currentUser;
		},
		onSuccess: (user) => {
			// Обновляем кэш с актуальными данными пользователя
			queryClient.setQueryData(["auth", "user"], user);
		},
		onError: () => {
			// Очищаем токен и данные пользователя в случае ошибки
			localStorage.removeItem("token");
			queryClient.setQueryData(["auth", "user"], null);
		},
	});

	// Mutation для регистрации
	const signupMutation = useMutation({
		mutationFn: async (credentials: SignUpCredentials) => {
			const response = await authService.signup(credentials);
			// Сразу получаем актуальные данные пользователя
			const currentUser = await authService.getMe();
			return currentUser;
		},
		onSuccess: (user) => {
			// Обновляем кэш с актуальными данными пользователя
			queryClient.setQueryData(["auth", "user"], user);
		},
		onError: () => {
			// Очищаем токен и данные пользователя в случае ошибки
			localStorage.removeItem("token");
			queryClient.setQueryData(["auth", "user"], null);
		},
	});

	// Функция для выхода
	const signout = () => {
		localStorage.removeItem("token");
		queryClient.setQueryData(["auth", "user"], null);
		// Полностью очищаем данные подписки
		queryClient.setQueryData(["subscription", "status"], null);
		// Удаляем все кэшированные запросы подписки
		queryClient.removeQueries({ queryKey: ["subscription"] });
		// Инвалидируем все связанные запросы
		queryClient.invalidateQueries({ queryKey: ["auth"] });
	};

	// Функция для входа
	const signin = async (credentials: SignInCredentials) => {
		return await signinMutation.mutateAsync(credentials);
	};

	// Функция для регистрации
	const signup = async (credentials: SignUpCredentials) => {
		return await signupMutation.mutateAsync(credentials);
	};

	return {
		user,
		isAuthenticated: !!user,
		isLoading,
		error,
		signin,
		signup,
		signout,
		isSigninLoading: signinMutation.isPending,
		isSignupLoading: signupMutation.isPending,
		signinError: signinMutation.error,
		signupError: signupMutation.error,
	};
};
