// Authentication service
// Handles login, logout, and registration API calls

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/apiConfig';
import { LoginCredentials, AuthResponse, ApiError } from '../types';

export const authService = {
  /**
   * Login user with email and password
   * Returns user data and JWT token
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.auth.login,
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Logout user
   * Invalidates token on backend (if token blacklist is implemented)
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } catch (error: any) {
      // Even if logout fails on backend, we should still clear local storage
      console.error('Logout error:', error);
      throw error as ApiError;
    }
  },

  /**
   * Register new user
   * Note: This endpoint may not be exposed in production, or may require additional fields
   */
  register: async (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.auth.register,
        data
      );
      return response.data;
    } catch (error: any) {
      throw error as ApiError;
    }
  },
};
