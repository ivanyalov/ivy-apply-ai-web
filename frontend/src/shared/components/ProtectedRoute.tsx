import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

/**
 * ProtectedRoute Component
 * 
 * A higher-order component that protects routes based on authentication and subscription status.
 * This component handles route protection logic and provides appropriate redirects and loading states.
 * 
 * @component
 * @description
 * - Checks if user is authenticated
 * - Validates subscription access for protected routes (like /chat)
 * - Shows loading state while checking authentication/subscription
 * - Redirects unauthenticated users to /auth
 * - Redirects users without subscription access to /access
 * 
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <ChatPage />
 * </ProtectedRoute>
 * ```
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render if access is granted
 * 
 * @returns {JSX.Element} The protected content or redirect component
 */
export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const location = useLocation();

  // Показываем загрузку подписки только если пользователь аутентифицирован
  const isLoading = isAuthLoading || (isAuthenticated && isSubscriptionLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Загрузка...</h2>
          <p className="text-gray-600">Пожалуйста, подождите, мы проверяем ваш доступ.</p>
        </div>
      </div>
    );
  }

  // If the user is not authenticated, redirect to the auth page.
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If the route is '/chat' and the user doesn't have an active subscription, redirect to the access page.
  if (location.pathname === '/chat' && !subscription?.hasAccess) {
    return <Navigate to="/access" replace />;
  }

  // If checks pass, render the requested component.
  return <>{children}</>;
}; 