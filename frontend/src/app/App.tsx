import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import AuthPage from "../pages/AuthPage";
import AccessSelectionPage from "../pages/AccessSelectionPage";
import ChatPage from "../pages/ChatPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import LandingPage from "../pages/LandingPage";
import CookieBanner from "../shared/components/CookieBanner";
import UserAgreement from "../pages/UserAgreement";
import Contact from "../pages/Contact";
import MainLayout from "../shared/components/MainLayout";

// Создаем QueryClient с настройками
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false,
		},
	},
});

const App: React.FC = () => {
	return (
		<QueryClientProvider client={queryClient}>
			<Router>
				<MainLayout>
					<Routes>
						<Route path="/" element={<LandingPage />} />
						<Route path="/auth" element={<AuthPage />} />
						<Route
							path="/access"
							element={
								<ProtectedRoute>
									<AccessSelectionPage />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/payment/success"
							element={
								<ProtectedRoute>
									<PaymentSuccessPage />
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
						<Route path="/user-agreement" element={<UserAgreement />} />
						<Route path="/contact" element={<Contact />} />
					</Routes>
				</MainLayout>
				<CookieBanner />
			</Router>
		</QueryClientProvider>
	);
};

export default App;
