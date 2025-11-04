// Event service
// Handles API calls for events (listing, details, ticket purchase)

import apiClient from './apiClient';
import { API_ENDPOINTS } from '../utils/apiConfig';
import { Event, Ticket, TicketPurchaseRequest, ApiError } from '../types';

/**
 * Normalize event data - ensures numeric fields are numbers (not strings)
 * PostgreSQL numeric types can be serialized as strings in JSON
 */
const normalizeEvent = (event: any): Event => {
  return {
    ...event,
    id: Number(event.id),
    price: Number(event.price),
    total_capacity: Number(event.total_capacity) || Number(event.total_tickets),
    available_tickets: Number(event.available_tickets),
    location: event.location || event.venue, // Map venue to location
  };
};

/**
 * Normalize ticket data - ensures numeric fields are numbers
 */
const normalizeTicket = (ticket: any): Ticket => {
  return {
    ...ticket,
    id: Number(ticket.id),
    event_id: Number(ticket.event_id),
    user_id: Number(ticket.user_id),
    quantity: Number(ticket.quantity),
    total_price: Number(ticket.total_price),
  };
};

export const eventService = {
  /**
   * Get list of all events (public endpoint)
   * Can be called without authentication
   */
  listEvents: async (): Promise<Event[]> => {
    try {
      const response = await apiClient.get<{ data?: Event[]; events?: Event[] } | Event[]>(
        API_ENDPOINTS.events.list
      );
      let events: any[] = [];
      
      // Handle different response shapes
      if (Array.isArray(response.data)) {
        events = response.data;
      } else if (response.data?.data) {
        events = response.data.data;
      } else if (response.data?.events) {
        events = response.data.events;
      }
      
      // Normalize all events to ensure numeric fields are numbers
      return events.map(normalizeEvent);
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Get event details by ID (public endpoint)
   */
  getEventById: async (id: number): Promise<Event> => {
    try {
      const response = await apiClient.get<{ data?: Event; event?: Event } | Event>(
        API_ENDPOINTS.events.getById(id)
      );
      const data = response.data;
      let event: any;
      
      // Handle different response shapes
      if (typeof data === 'object' && data !== null) {
        if ('data' in data && data.data) {
          event = data.data;
        } else if ('event' in data && data.event) {
          event = data.event;
        } else {
          event = data;
        }
      } else {
        event = data;
      }
      
      // Normalize event to ensure numeric fields are numbers
      return normalizeEvent(event);
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Purchase tickets for an event (protected endpoint - requires authentication)
   */
  purchaseTickets: async (request: TicketPurchaseRequest): Promise<Ticket> => {
    try {
      const response = await apiClient.post<{ data?: Ticket; ticket?: Ticket } | Ticket>(
        API_ENDPOINTS.events.purchase(request.eventId),
        { quantity: request.quantity }
      );
      const data = response.data;
      let ticket: any;
      
      // Handle different response shapes
      if (typeof data === 'object' && data !== null) {
        if ('data' in data && data.data) {
          ticket = data.data;
        } else if ('ticket' in data && data.ticket) {
          ticket = data.ticket;
        } else {
          ticket = data;
        }
      } else {
        ticket = data;
      }
      
      // Normalize ticket to ensure numeric fields are numbers
      return normalizeTicket(ticket);
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Create a new event (admin only)
   */
  createEvent: async (eventData: Partial<Event>): Promise<Event> => {
    try {
      const response = await apiClient.post<{ data?: Event; event?: Event } | Event>(
        API_ENDPOINTS.events.create,
        eventData
      );
      const data = response.data;
      let event: any;
      
      // Handle different response shapes
      if (typeof data === 'object' && data !== null) {
        if ('data' in data && data.data) {
          event = data.data;
        } else if ('event' in data && data.event) {
          event = data.event;
        } else {
          event = data;
        }
      } else {
        event = data;
      }
      
      return normalizeEvent(event);
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Update an event (admin only)
   */
  updateEvent: async (id: number, eventData: Partial<Event>): Promise<Event> => {
    try {
      const response = await apiClient.put<{ data?: Event; event?: Event } | Event>(
        API_ENDPOINTS.events.update(id),
        eventData
      );
      const data = response.data;
      let event: any;
      
      // Handle different response shapes
      if (typeof data === 'object' && data !== null) {
        if ('data' in data && data.data) {
          event = data.data;
        } else if ('event' in data && data.event) {
          event = data.event;
        } else {
          event = data;
        }
      } else {
        event = data;
      }
      
      return normalizeEvent(event);
    } catch (error: any) {
      throw error as ApiError;
    }
  },

  /**
   * Delete an event (admin only)
   */
  deleteEvent: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.events.delete(id));
    } catch (error: any) {
      throw error as ApiError;
    }
  },
};
