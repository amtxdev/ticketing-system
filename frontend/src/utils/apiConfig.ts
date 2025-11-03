// API configuration and base URL
// In production, this would typically come from environment variables

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
  },
  events: {
    list: `${API_BASE_URL}/events`,
    getById: (id: number) => `${API_BASE_URL}/events/${id}`,
    purchase: (eventId: number) => `${API_BASE_URL}/events/${eventId}/purchase`,
  },
} as const;

export default API_BASE_URL;
