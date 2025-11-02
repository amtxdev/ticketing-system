export interface Event {
  id?: number;
  title: string;
  description?: string;
  venue?: string;
  event_date: Date | string;
  total_tickets: number;
  available_tickets: number;
  price: number;
  image_url?: string;
  status?: "upcoming" | "live" | "completed" | "cancelled";
  created_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateEventDto {
  title: string;
  description?: string;
  venue?: string;
  event_date: Date | string;
  total_tickets: number;
  price: number;
  image_url?: string;
  status?: "upcoming" | "live" | "completed" | "cancelled";
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  venue?: string;
  event_date?: Date | string;
  total_tickets?: number;
  available_tickets?: number;
  price?: number;
  image_url?: string;
  status?: "upcoming" | "live" | "completed" | "cancelled";
}

export interface EventQueryParams {
  status?: string;
  venue?: string;
  limit?: number;
  offset?: number;
  from_date?: string;
  to_date?: string;
}

export interface PurchaseTicketDto {
  event_id: number;
  quantity: number;
}

