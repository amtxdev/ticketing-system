// Type definitions for the frontend application

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
  is_active: boolean;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  event_date: string;
  location?: string;
  total_capacity: number;
  available_tickets: number;
  price: number;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: number;
  event_id: number;
  user_id: number;
  quantity: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
}

export interface AuthResponse {
  message: string;
  data: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TicketPurchaseRequest {
  eventId: number;
  quantity: number;
}

export interface ApiError {
  error: string;
  message: string;
}
