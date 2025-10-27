import { useState, useEffect, useCallback } from 'react';
import type { User } from '../types';

// --- Mock Database Helper Functions ---

const MOCK_DB_USERS_KEY = 'bytebuddy_mock_users';
const AUTH_USER_KEY = 'bytebuddy_auth_user_email'; // Switched to a more descriptive key
const RESET_CODES_KEY = 'bytebuddy_reset_codes';

// A simple in-memory cache to avoid repeated JSON.parse from localStorage
let usersCache: User[] | null = null;

const getUsers = (): User[] => {
    if (usersCache) return usersCache;
    try {
        const usersJson = localStorage.getItem(MOCK_DB_USERS_KEY);
        usersCache = usersJson ? JSON.parse(usersJson) : [];
        return usersCache!;
    } catch {
        return [];
    }
};

const saveUsers = (users: User[]) => {
    usersCache = users;
    localStorage.setItem(MOCK_DB_USERS_KEY, JSON.stringify(users));
};

// --- The Auth Hook ---

export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Effect to check for an active session on initial load
    useEffect(() => {
        try {
            // FIX: Use localStorage instead of sessionStorage for persistence
            const authenticatedEmail = localStorage.getItem(AUTH_USER_KEY);
            if (authenticatedEmail) {
                const users = getUsers();
                const loggedInUser = users.find(u => u.email === authenticatedEmail);
                if (loggedInUser) {
                    // Don't expose password to the app state
                    const { password, ...userToSet } = loggedInUser;
                    setCurrentUser(userToSet);
                }
            }
        } catch (error) {
            console.error("Failed to load session:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const signup = useCallback(async (name: string, email: string, password_raw: string): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const users = getUsers();
                const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (existingUser) {
                    resolve({ success: false, message: 'An account with this email already exists.' });
                    return;
                }
                
                if (password_raw.length < 6) {
                     resolve({ success: false, message: 'Password must be at least 6 characters long.' });
                    return;
                }

                const newUser: User = {
                    id: Date.now().toString(),
                    name,
                    email: email.toLowerCase(),
                    password: password_raw, // In a real app, HASH THIS!
                };

                const updatedUsers = [...users, newUser];
                saveUsers(updatedUsers);
                
                // FIX: Use localStorage for persistence
                localStorage.setItem(AUTH_USER_KEY, newUser.email);
                const { password, ...userToSet } = newUser;
                setCurrentUser(userToSet);

                resolve({ success: true, message: 'Signup successful!' });
            }, 500);
        });
    }, []);

    const login = useCallback(async (email: string, password_raw: string): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const users = getUsers();
                const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

                if (!user || user.password !== password_raw) {
                    resolve({ success: false, message: 'Invalid email or password.' });
                    return;
                }
                
                // FIX: Use localStorage for persistence
                localStorage.setItem(AUTH_USER_KEY, user.email);
                const { password, ...userToSet } = user;
                setCurrentUser(userToSet);
                resolve({ success: true, message: 'Login successful!' });
            }, 500);
        });
    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        // FIX: Use localStorage for persistence
        localStorage.removeItem(AUTH_USER_KEY);
        // We don't need to navigate here, the router will handle it.
    }, []);

    const sendPasswordResetCode = useCallback(async (email: string): Promise<{ success: boolean; message: string; code?: string }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const users = getUsers();
                const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

                if (!userExists) {
                    resolve({ success: false, message: "No account found with that email address." });
                    return;
                }
                
                const code = Math.floor(100000 + Math.random() * 900000).toString();
                // Store code with expiry for this demo
                const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
                resetCodes[email.toLowerCase()] = { code, expires: Date.now() + 10 * 60 * 1000 }; // 10 min expiry
                localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));

                resolve({ success: true, message: "Verification code sent.", code }); // return code for demo UI
            }, 500);
        });
    }, []);

    const resetPassword = useCallback(async (email: string, code: string, newPassword_raw: string): Promise<{ success: boolean; message: string; }> => {
        return new Promise(resolve => {
            setTimeout(() => {
                const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
                const storedCodeData = resetCodes[email.toLowerCase()];

                if (!storedCodeData || storedCodeData.code !== code || Date.now() > storedCodeData.expires) {
                    resolve({ success: false, message: "Invalid or expired verification code." });
                    return;
                }
                
                if (newPassword_raw.length < 6) {
                    resolve({ success: false, message: 'Password must be at least 6 characters long.' });
                   return;
               }

                let users = getUsers();
                const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

                if (userIndex === -1) {
                    // This case should be rare if sendPasswordResetCode worked, but good to have
                    resolve({ success: false, message: "User not found." });
                    return;
                }

                users[userIndex].password = newPassword_raw; // Again, HASH in real app
                saveUsers(users);
                
                // Clean up the used code
                delete resetCodes[email.toLowerCase()];
                localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));

                resolve({ success: true, message: "Your password has been reset successfully." });
            }, 500);
        });
    }, []);

    return {
        currentUser,
        isLoading,
        signup,
        login,
        logout,
        sendPasswordResetCode,
        resetPassword,
    };
};