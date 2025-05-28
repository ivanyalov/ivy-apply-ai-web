import { vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

// Mock the hooks
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../context/SubscriptionContext', () => ({
  useSubscription: vi.fn(),
  SubscriptionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Test components
const TestPage = () => <div>Test Page</div>;
const AuthPage = () => <div>Auth Page</div>;
const AccessPage = () => <div>Access Page</div>;
const ChatPage = () => <div>Chat Page</div>;

const renderWithRouter = (
  initialRoute: string,
  isAuthenticated: boolean,
  hasSubscription: boolean
) => {
  // Mock the contexts with the provided values
  (useAuth as any).mockReturnValue({
    user: isAuthenticated ? { id: '1', email: 'test@example.com' } : null,
    isAuthenticated,
    isLoading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  });

  (useSubscription as any).mockReturnValue({
    subscriptionStatus: hasSubscription
      ? {
          hasAccess: true,
          type: 'premium',
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        }
      : null,
    isLoading: false,
    error: null,
    refreshStatus: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <SubscriptionProvider>
          <Routes>
            {/* Main page is not wrapped in ProtectedRoute */}
            <Route path="/" element={<TestPage />} />
            <Route
              path="/auth"
              element={
                <ProtectedRoute>
                  <AuthPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/access"
              element={
                <ProtectedRoute>
                  <AccessPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </SubscriptionProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  describe('Main Page (/)', () => {
    it('should stay on page when not logged in', () => {
      renderWithRouter('/', false, false);
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should stay on page when logged in without subscription', () => {
      renderWithRouter('/', true, false);
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('should stay on page when logged in with subscription', () => {
      renderWithRouter('/', true, true);
      expect(screen.getByText('Test Page')).toBeInTheDocument();
    });
  });

  describe('Auth Page (/auth)', () => {
    it('should stay on page when not logged in', () => {
      renderWithRouter('/auth', false, false);
      expect(screen.getByText('Auth Page')).toBeInTheDocument();
    });

    it('should redirect to access when logged in without subscription', () => {
      renderWithRouter('/auth', true, false);
      expect(screen.getByText('Access Page')).toBeInTheDocument();
    });

    it('should redirect to chat when logged in with subscription', () => {
      renderWithRouter('/auth', true, true);
      expect(screen.getByText('Chat Page')).toBeInTheDocument();
    });
  });

  describe('Access Page (/access)', () => {
    it('should redirect to auth when not logged in', () => {
      renderWithRouter('/access', false, false);
      expect(screen.getByText('Auth Page')).toBeInTheDocument();
    });

    it('should stay on page when logged in without subscription', () => {
      renderWithRouter('/access', true, false);
      expect(screen.getByText('Access Page')).toBeInTheDocument();
    });

    it('should redirect to chat when logged in with subscription', () => {
      renderWithRouter('/access', true, true);
      expect(screen.getByText('Chat Page')).toBeInTheDocument();
    });
  });

  describe('Chat Page (/chat)', () => {
    it('should redirect to auth when not logged in', () => {
      renderWithRouter('/chat', false, false);
      expect(screen.getByText('Auth Page')).toBeInTheDocument();
    });

    it('should redirect to access when logged in without subscription', () => {
      renderWithRouter('/chat', true, false);
      expect(screen.getByText('Access Page')).toBeInTheDocument();
    });

    it('should stay on page when logged in with subscription', () => {
      renderWithRouter('/chat', true, true);
      expect(screen.getByText('Chat Page')).toBeInTheDocument();
    });
  });
}); 