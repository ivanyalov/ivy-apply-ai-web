import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import RegistrationSuccessPage from "../pages/RegistrationSuccessPage";
import EmailVerificationPage from "../pages/EmailVerificationPage";
import AccessSelectionPage from "../pages/AccessSelectionPage";
import ChatPage from "../pages/ChatPage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import LandingPage from "../pages/LandingPage";
import CookieBanner from "../shared/components/CookieBanner";
import UserAgreement from "../pages/UserAgreement";
import Contact from "../pages/Contact";
import MainLayout from "../shared/components/MainLayout";
import PublicOffer from "../pages/PublicOffer";

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
						<Route path="/login" element={<LoginPage />} />
						<Route path="/register" element={<RegisterPage />} />
						<Route path="/registration-success" element={<RegistrationSuccessPage />} />
						<Route path="/verify" element={<EmailVerificationPage />} />
						<Route path="/auth" element={<Navigate to="/login" replace />} />
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
						<Route path="/public-offer" element={<PublicOffer />} />
					</Routes>
				</MainLayout>
				<CookieBanner />
			</Router>
		</QueryClientProvider>
	);
};

export default App;
