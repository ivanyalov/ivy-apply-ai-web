import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi, describe, it, beforeEach, expect } from "vitest";
import { ProtectedRoute } from "../ProtectedRoute";
import { useAuth } from "../../hooks/useAuth";
import { useSubscription } from "../../hooks/useSubscription";

// Mock the hooks
vi.mock("../../hooks/useAuth");
vi.mock("../../hooks/useSubscription");

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseSubscription = useSubscription as ReturnType<typeof vi.fn>;

// Test components
const TestPage = () => <div>Test Page</div>;

describe("ProtectedRoute", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should render children when user is authenticated and has subscription", () => {
		mockUseAuth.mockReturnValue({
			user: { id: "1", email: "test@example.com" },
			isAuthenticated: true,
			isLoading: false,
			error: null,
			signin: vi.fn(),
			signup: vi.fn(),
			signout: vi.fn(),
			isSigninLoading: false,
			isSignupLoading: false,
			signinError: null,
			signupError: null,
		});

		mockUseSubscription.mockReturnValue({
			subscription: {
				hasAccess: true,
				type: "premium",
				status: "active",
				expiresAt: new Date(Date.now() + 86400000),
			},
			isLoading: false,
			error: null,
			refreshSubscription: vi.fn(),
			cancelSubscription: vi.fn(),
			startTrial: vi.fn(),
			isCancelling: false,
			isStartingTrial: false,
			cancelError: null,
			startTrialError: null,
		});

		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter>
					<ProtectedRoute>
						<TestPage />
					</ProtectedRoute>
				</MemoryRouter>
			</QueryClientProvider>
		);

		expect(screen.getByText("Test Page")).toBeInTheDocument();
	});

	it("should show loading state when authentication is loading", () => {
		mockUseAuth.mockReturnValue({
			user: null,
			isAuthenticated: false,
			isLoading: true,
			error: null,
			signin: vi.fn(),
			signup: vi.fn(),
			signout: vi.fn(),
			isSigninLoading: false,
			isSignupLoading: false,
			signinError: null,
			signupError: null,
		});

		mockUseSubscription.mockReturnValue({
			subscription: undefined,
			isLoading: false,
			error: null,
			refreshSubscription: vi.fn(),
			cancelSubscription: vi.fn(),
			startTrial: vi.fn(),
			isCancelling: false,
			isStartingTrial: false,
			cancelError: null,
			startTrialError: null,
		});

		const queryClient = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});

		render(
			<QueryClientProvider client={queryClient}>
				<MemoryRouter>
					<ProtectedRoute>
						<TestPage />
					</ProtectedRoute>
				</MemoryRouter>
			</QueryClientProvider>
		);

		expect(screen.getByText("Загрузка...")).toBeInTheDocument();
	});
});
