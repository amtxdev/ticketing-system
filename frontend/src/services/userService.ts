// User service
// Handles user management API calls (admin only)

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/apiConfig';
import { User, ApiError } from '../types';

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: 'user' | 'admin';
  is_active?: boolean;
}

export interface ListUsersParams {
  role?: 'user' | 'admin';
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListUsersResponse {
  message: string;
  data: User[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

export const userService = {
  /**
   * List all users (admin only)
   */
  listUsers: async (params?: ListUsersParams): Promise<ListUsersResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.role) queryParams.append('role', params.role);
      if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.offset) queryParams.append('offset', params.offset.toString());

      const url = queryParams.toString() 
        ? `${API_ENDPOINTS.users.list}?${queryParams.toString()}`
        : API_ENDPOINTS.users.list;

      const response = await apiClient.get<ListUsersResponse>(url);
      return response.data;
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Get user by ID (admin can view any, users can view their own)
   */
  getUser: async (id: number): Promise<{ message: string; data: User }> => {
    try {
      const response = await apiClient.get<{ message: string; data: User }>(
        API_ENDPOINTS.users.getById(id)
      );
      return response.data;
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Create a new user (admin only)
   */
  createUser: async (data: CreateUserRequest): Promise<{ message: string; data: User }> => {
    try {
      const response = await apiClient.post<{ message: string; data: User }>(
        API_ENDPOINTS.users.create,
        data
      );
      return response.data;
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Update user (admin can update any, users can update their own)
   */
  updateUser: async (
    id: number,
    data: UpdateUserRequest
  ): Promise<{ message: string; data: User }> => {
    try {
      const response = await apiClient.put<{ message: string; data: User }>(
        API_ENDPOINTS.users.update(id),
        data
      );
      return response.data;
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Delete user (admin only)
   */
  deleteUser: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await apiClient.delete<{ message: string }>(
        API_ENDPOINTS.users.delete(id)
      );
      return response.data;
    } catch (error: any) {
      throw error as ApiError;
    }
  },
};

