import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionService, SubscriptionStatus } from '../api/subscription';
import { useAuth } from './AuthContext';

interface SubscriptionContextType {
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const checkSubscriptionStatus = async () => {
    if (!isAuthenticated) {
      setSubscriptionStatus(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const status = await subscriptionService.getStatus();
      setSubscriptionStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check subscription status');
      setSubscriptionStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
  }, [isAuthenticated]);

  const refreshStatus = async () => {
    await checkSubscriptionStatus();
  };

  return (
    <SubscriptionContext.Provider value={{ subscriptionStatus, isLoading, error, refreshStatus }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}; 