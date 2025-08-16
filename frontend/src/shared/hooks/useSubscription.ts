import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService, SubscriptionStatus } from "../api/subscription";
import { useAuth } from "./useAuth";

/**
 * @hook useSubscription
 * @description Кастомный хук для управления подпиской с использованием TanStack Query.
 * Заменяет SubscriptionContext и предоставляет методы для управления подпиской.
 *
 * @returns {Object} Объект с данными и методами подписки.
 *
 * @example
 * ```tsx
 * const { subscription, isLoading, refreshSubscription, cancelSubscription, startTrial } = useSubscription();
 *
 * if (isLoading) return <div>Загрузка...</div>;
 * if (subscription?.hasAccess) return <div>У вас есть доступ</div>;
 * ```
 */
export const useSubscription = () => {
	const queryClient = useQueryClient();
	const { isAuthenticated } = useAuth();

	// Query для получения статуса подписки
	const {
		data: subscription,
		isLoading,
		error,
		refetch: refreshSubscription,
	} = useQuery({
		queryKey: ["subscription", "status"],
		queryFn: async () => {
			return await subscriptionService.getStatus();
		},
		enabled: isAuthenticated, // Запрос выполняется только если пользователь аутентифицирован
		staleTime: 2 * 60 * 1000, // 2 минуты
	});

	// Mutation для отмены подписки
	const cancelSubscriptionMutation = useMutation({
		mutationFn: async () => {
			return await subscriptionService.cancel();
		},
		onSuccess: () => {
			// Инвалидируем кэш подписки после отмены
			queryClient.invalidateQueries({ queryKey: ["subscription"] });
		},
		onError: (error) => {
			console.error("Failed to cancel subscription:", error);
		},
	});

	// Mutation для начала пробного периода
	const startTrialMutation = useMutation({
		mutationFn: async () => {
			return await subscriptionService.startTrial();
		},
		onSuccess: () => {
			// Инвалидируем кэш подписки после начала пробного периода
			queryClient.invalidateQueries({ queryKey: ["subscription"] });
		},
		onError: (error) => {
			console.error("Failed to start trial:", error);
		},
	});

	// Функция для отмены подписки
	const cancelSubscription = async () => {
		return await cancelSubscriptionMutation.mutateAsync();
	};

	// Функция для начала пробного периода
	const startTrial = async () => {
		return await startTrialMutation.mutateAsync();
	};

	return {
		subscription,
		isLoading,
		error,
		refreshSubscription,
		cancelSubscription,
		startTrial,
		isCancelling: cancelSubscriptionMutation.isPending,
		isStartingTrial: startTrialMutation.isPending,
		cancelError: cancelSubscriptionMutation.error,
		startTrialError: startTrialMutation.error,
	};
};
