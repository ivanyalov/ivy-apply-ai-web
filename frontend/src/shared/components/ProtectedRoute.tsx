import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { subscriptionService, SubscriptionStatus } from '../api/subscription';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireSubscription = true 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (isAuthenticated && requireSubscription) {
        try {
          const status = await subscriptionService.getStatus();
          setSubscriptionStatus(status);
        } catch (error) {
          console.error('Error checking subscription status:', error);
        } finally {
          setIsCheckingSubscription(false);
        }
      } else {
        setIsCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, requireSubscription]);

  if (isLoading || isCheckingSubscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h2>
          <p className="text-gray-600">Please wait while we verify your access.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth page but save the attempted url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireSubscription && (!subscriptionStatus?.hasAccess)) {
    // Redirect to access page if subscription is required but not active
    return <Navigate to="/access" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 