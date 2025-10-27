import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import SignUpPage from './components/auth/SignUpPage';
import ProtectedApp from './ProtectedApp';
import ForgotPasswordPage from './components/auth/ForgotPasswordPage';

// Root component that sets up providers
const App: React.FC = () => {
    return (
        <HashRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </HashRouter>
    );
};

// Component to handle routing logic
const AppRoutes: React.FC = () => {
    const { currentUser, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="text-2xl font-semibold text-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="/signup" element={!currentUser ? <SignUpPage /> : <Navigate to="/" replace />} />
            <Route path="/forgot-password" element={!currentUser ? <ForgotPasswordPage /> : <Navigate to="/" replace />} />
            <Route path="/*" element={currentUser ? <ProtectedApp /> : <Navigate to="/login" replace />} />
        </Routes>
    );
};

export default App;