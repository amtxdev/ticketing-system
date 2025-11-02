export type UserRole = "user" | "admin";

export interface User {
  id?: number;
  email: string;
  password_hash?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface RegisterDto {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserQueryParams {
  role?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

