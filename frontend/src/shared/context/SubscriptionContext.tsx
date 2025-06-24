import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { subscriptionService, SubscriptionStatus } from '../api/subscription';
import { useAuth } from './AuthContext';

/**
 * @interface SubscriptionContextType
 * @description Интерфейс контекста подписки, предоставляющий методы для управления подпиской пользователя.
 * @property {SubscriptionStatus | null} subscription - Текущий статус подписки пользователя.
 * @property {boolean} isLoading - Флаг загрузки данных подписки.
 * @property {() => Promise<void>} refreshSubscription - Метод для обновления данных подписки.
 * @property {() => Promise<void>} cancelSubscription - Метод для отмены подписки.
 * @property {() => Promise<void>} startTrial - Метод для начала пробного периода.
 */
interface SubscriptionContextType {
  subscription: SubscriptionStatus | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
  cancelSubscription: () => Promise<void>;
  startTrial: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

/**
 * @component SubscriptionProvider
 * @description Провайдер контекста подписки, управляющий состоянием подписки пользователя.
 * Автоматически загружает данные подписки при изменении статуса аутентификации.
 * 
 * @param {React.ReactNode} children - Дочерние компоненты, которые будут иметь доступ к контексту.
 * @returns {JSX.Element} Провайдер контекста с методами управления подпиской.
 * 
 * @example
 * ```tsx
 * <SubscriptionProvider>
 *   <App />
 * </SubscriptionProvider>
 * ```
 */
export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticatedRef = useRef(isAuthenticated);

  /**
   * @method refreshSubscription
   * @description Обновляет данные подписки пользователя с сервера.
   * Вызывается автоматически при изменении статуса аутентификации.
   * 
   * @returns {Promise<void>} Promise, который разрешается после обновления данных.
   */
  const refreshSubscription = useCallback(async () => {
    if (isAuthenticatedRef.current) {
      setIsLoading(true);
      try {
        const status = await subscriptionService.getStatus();
        setSubscription(status);
      } catch (error) {
        console.error("Failed to fetch subscription status", error);
        setSubscription(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSubscription(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * @method cancelSubscription
   * @description Отменяет текущую подписку пользователя и обновляет данные.
   * 
   * @returns {Promise<void>} Promise, который разрешается после отмены подписки.
   */
  const cancelSubscription = useCallback(async () => {
    await subscriptionService.cancel();
    await refreshSubscription();
  }, [refreshSubscription]);

  /**
   * @method startTrial
   * @description Начинает пробный период для пользователя и обновляет данные.
   * 
   * @returns {Promise<void>} Promise, который разрешается после начала пробного периода.
   */
  const startTrial = useCallback(async () => {
    await subscriptionService.startTrial();
    await refreshSubscription();
  }, [refreshSubscription]);

  // Загружаем подписку только при изменении статуса аутентификации И только если пользователь аутентифицирован
  useEffect(() => {
    // Обновляем ref для использования в callback'ах
    isAuthenticatedRef.current = isAuthenticated;
    
    if (isAuthenticated) {
      const loadSubscription = async () => {
        setIsLoading(true);
        try {
          const status = await subscriptionService.getStatus();
          setSubscription(status);
        } catch (error) {
          console.error("Failed to fetch subscription status", error);
          setSubscription(null);
        } finally {
          setIsLoading(false);
        }
      };

      loadSubscription();
    } else {
      // Если пользователь не аутентифицирован, очищаем данные подписки
      setSubscription(null);
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <SubscriptionContext.Provider value={{ subscription, isLoading, refreshSubscription, cancelSubscription, startTrial }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * @hook useSubscription
 * @description Хук для доступа к контексту подписки в компонентах.
 * 
 * @returns {AuthContextType} Объект с данными и методами подписки.
 * @throws {Error} Если хук используется вне SubscriptionProvider.
 * 
 * @example
 * ```tsx
 * const { subscription, isLoading, refreshSubscription } = useSubscription();
 * 
 * if (isLoading) return <div>Загрузка...</div>;
 * if (subscription?.hasAccess) return <div>У вас есть доступ</div>;
 * ```
 */
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 