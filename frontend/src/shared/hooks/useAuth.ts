import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
export const useAuth = () => {
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
		retry: false,
		staleTime: 5 * 60 * 1000, // 5 минут
	});

	// Mutation для входа
	const signinMutation = useMutation({
		mutationFn: async (credentials: SignInCredentials) => {
			const { user } = await authService.signin(credentials);
			return user;
		},
		onSuccess: (user) => {
			// Обновляем кэш с данными пользователя
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
			const { user } = await authService.signup(credentials);
			return user;
		},
		onSuccess: (user) => {
			// Обновляем кэш с данными пользователя
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
		// Инвалидируем все связанные запросы
		queryClient.invalidateQueries({ queryKey: ["auth"] });
		queryClient.invalidateQueries({ queryKey: ["subscription"] });
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
