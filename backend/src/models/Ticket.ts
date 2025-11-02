export interface Ticket {
  id?: number;
  title: string;
  description?: string;
  status?: "open" | "in_progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  created_by?: string;
  assigned_to?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateTicketDto {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  created_by?: string;
  assigned_to?: string;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: "open" | "in_progress" | "resolved" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
}

export interface TicketQueryParams {
  status?: string;
  priority?: string;
  created_by?: string;
  assigned_to?: string;
  limit?: number;
  offset?: number;
}

