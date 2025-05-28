import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthResponse, SignInCredentials, SignUpCredentials } from '../api/auth';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          setUser(response.user);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        authService.signOut();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (credentials: SignInCredentials) => {
    const response = await authService.signIn(credentials);
    setUser(response.user);
  };

  const signUp = async (credentials: SignUpCredentials) => {
    const response = await authService.signUp(credentials);
    setUser(response.user);
  };

  const signOut = () => {
    authService.signOut();
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 