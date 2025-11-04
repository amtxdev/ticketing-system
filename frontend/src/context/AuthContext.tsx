// Authentication Context
// Provides authentication state and methods throughout the application
// Manages user session, token storage, and auth state

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { tokenStorage } from '../utils/tokenStorage';
import { User, LoginCredentials, ApiError } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = tokenStorage.getUser();
        const storedToken = tokenStorage.getToken();
        
        if (storedUser && storedToken) {
          setUser(storedUser);
        } else {
          // If no token/user in storage, ensure state is cleared
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        tokenStorage.removeToken();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for unauthorized events (e.g., 401 response)
    const handleUnauthorized = () => {
      setUser(null);
      tokenStorage.removeToken();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Listen for storage changes (e.g., when localStorage is cleared in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'auth_user' || e.key === null) {
        // localStorage was cleared or auth data was modified
        const storedToken = tokenStorage.getToken();
        const storedUser = tokenStorage.getUser();
        
        if (!storedToken || !storedUser) {
          setUser(null);
        } else {
          setUser(storedUser);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Periodically check if token still exists in localStorage
  // This catches cases where localStorage is cleared in the same tab
  // (storage event only fires for cross-tab changes)
  useEffect(() => {
    const checkAuthState = () => {
      const storedToken = tokenStorage.getToken();
      const storedUser = tokenStorage.getUser();
      
      if (!storedToken || !storedUser) {
        // Use functional update to avoid dependency issues
        setUser((currentUser) => {
          if (currentUser !== null) {
            // Token was cleared but state still has user
            return null;
          }
          return currentUser;
        });
      }
    };

    // Check every 1 second (for same-tab localStorage clearing)
    const intervalId = setInterval(checkAuthState, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      
      // Store token and user data
      tokenStorage.setToken(response.token);
      tokenStorage.setUser(response.data);
      
      setUser(response.data);
    } catch (error) {
      const apiError = error as ApiError;
      throw new Error(apiError.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local state regardless of API response
      tokenStorage.removeToken();
      setUser(null);
    }
  };

  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
