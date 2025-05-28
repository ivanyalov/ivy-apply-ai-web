import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSubscription = false 
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { subscriptionStatus, isLoading: isSubscriptionLoading } = useSubscription();
  const location = useLocation();

  // Show loading state while checking auth or subscription
  if (isAuthLoading || isSubscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  const currentPath = location.pathname;

  // Handle main page routing - always stay on page regardless of auth/subscription status
  if (currentPath === '/') {
    return <>{children}</>;
  }

  // Handle auth page routing
  if (currentPath === '/auth') {
    if (!isAuthenticated) {
      return <>{children}</>; // Stay on auth page if not logged in
    }
    if (subscriptionStatus?.hasAccess) {
      return <Navigate to="/chat" replace />; // Redirect to chat if has subscription
    }
    return <Navigate to="/access" replace />; // Redirect to access if logged in but no subscription
  }

  // Handle access page routing
  if (currentPath === '/access') {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />; // Redirect to auth if not logged in
    }
    if (subscriptionStatus?.hasAccess) {
      return <Navigate to="/chat" replace />; // Redirect to chat if has subscription
    }
    return <>{children}</>; // Stay on access page if logged in but no subscription
  }

  // Handle chat page routing
  if (currentPath === '/chat') {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />; // Redirect to auth if not logged in
    }
    if (!subscriptionStatus?.hasAccess) {
      return <Navigate to="/access" replace />; // Redirect to access if no subscription
    }
    return <>{children}</>; // Stay on chat if has subscription
  }

  // For any other page, stay on the page
  return <>{children}</>;
}; 