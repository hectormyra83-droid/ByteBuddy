import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User } from '../types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Effect to check for an active session and subscribe to auth state changes
    useEffect(() => {
        const fetchUserProfile = async (session: Session | null) => {
            if (session?.user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('id, name')
                    .eq('id', session.user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error);
                    setCurrentUser(null);
                } else if (profile) {
                    setCurrentUser({
                        id: session.user.id,
                        email: session.user.email!,
                        name: profile.name || 'User',
                    });
                }
            } else {
                setCurrentUser(null);
            }
            setIsLoading(false);
        };
        
        // Fetch session on initial load
        supabase.auth.getSession().then(({ data: { session } }) => {
            fetchUserProfile(session);
        });

        // Subscribe to auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event: AuthChangeEvent, session: Session | null) => {
                fetchUserProfile(session);
            }
        );

        // Cleanup subscription on unmount
        return () => {
            subscription?.unsubscribe();
        };
    }, []);

    const signup = async (name: string, email: string, password_raw: string): Promise<{ success: boolean; message: string }> => {
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password_raw,
            options: {
                data: {
                    name: name,
                },
            },
        });

        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, message: 'Signup successful! Please check your email to verify your account.' };
    };

    const login = async (email: string, password_raw: string): Promise<{ success: boolean; message: string }> => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password: password_raw,
        });

        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, message: 'Login successful!' };
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
        setCurrentUser(null);
    };

    const sendPasswordResetCode = async (email: string): Promise<{ success: boolean; message: string; }> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
             // Vercel deployment URL should be set in Supabase Auth settings
            redirectTo: window.location.origin,
        });

        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, message: 'Password reset link sent to your email.' };
    };


    return {
        currentUser,
        isLoading,
        signup,
        login,
        logout,
        sendPasswordResetCode,
    };
};
