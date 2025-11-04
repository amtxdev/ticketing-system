export interface Ticket {
  id?: number;
  event_id?: number;
  user_id?: number;
  title: string;
  description?: string;
  status?: "open" | "in_progress" | "resolved" | "closed" | "purchased" | "cancelled";
  priority?: "low" | "medium" | "high" | "urgent";
  ticket_type?: "support" | "event";
  quantity?: number;
  purchase_price?: number;
  purchase_date?: Date;
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
  user_id?: number;
  status?: string;
  priority?: string;
  created_by?: string;
  assigned_to?: string;
  limit?: number;
  offset?: number;
}

