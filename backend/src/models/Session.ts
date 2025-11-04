export interface Session {
  id?: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  is_revoked?: boolean;
  revoked_at?: Date;
  device_info?: string;
  ip_address?: string;
  created_at?: Date;
  last_used_at?: Date;
}

export interface CreateSessionDto {
  user_id: number;
  token_hash: string;
  expires_at: Date;
  device_info?: string;
  ip_address?: string;
}

