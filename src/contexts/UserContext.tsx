import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import authService, { AuthUser } from '../database/authService';

interface UserContextType {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>;
  signOut: () => void;
  updateUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange((newUser) => {
      setUser(newUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (username: string, password: string) => {
    return await authService.signUp(username, password);
  };

  const signIn = async (username: string, password: string) => {
    return await authService.signIn(username, password);
  };

  const signOut = () => {
    authService.signOut();
  };

  const updateUsername = async (newUsername: string) => {
    return await authService.updateUsername(newUsername);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    return await authService.updatePassword(currentPassword, newPassword);
  };

  const value: UserContextType = {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    updateUsername,
    updatePassword,
    isLoggedIn: user !== null
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}