// Base API client with axios configuration
// Handles request/response interceptors, error handling, and token injection

import axios, { AxiosInstance, AxiosError } from 'axios';
import { tokenStorage } from '../utils/tokenStorage';
import API_BASE_URL from '../utils/apiConfig';
import { ApiError } from '../types';

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Inject auth token into requests
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle common errors (401, 403, etc.)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      // Clear stored auth data
      tokenStorage.removeToken();
      // Redirect to login will be handled by the auth context/route guard
      // Optionally dispatch an event that the auth context can listen to
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }

    // Return error in a consistent format
    return Promise.reject({
      error: error.response?.data?.error || 'Request failed',
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status,
    });
  }
);

export default apiClient;
