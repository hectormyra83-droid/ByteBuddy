import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import type { User } from '../types';

interface AuthContextType {
    currentUser: User | null;
    isLoading: boolean;
    signup: (name: string, email: string, password_raw: string) => Promise<{ success: boolean; message: string }>;
    login: (email: string, password_raw: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    sendPasswordResetCode: (email: string) => Promise<{ success: boolean; message: string; }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const auth = useAuth();
    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
