import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../shared/context/AuthContext';
import { SubscriptionProvider } from '../shared/context/SubscriptionContext';
import { ProtectedRoute } from '../shared/components/ProtectedRoute';
import AuthPage from '../pages/AuthPage';
import AccessSelectionPage from '../pages/AccessSelectionPage';
import ChatPage from '../pages/ChatPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import LandingPage from '../pages/LandingPage';
import CookieBanner from '../shared/components/CookieBanner';
import UserAgreement from '../pages/UserAgreement';
import Contact from '../pages/Contact';
import MainLayout from '../shared/components/MainLayout';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <MainLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
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
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
