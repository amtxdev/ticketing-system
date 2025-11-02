import { Request, Response } from "express";
import { EventService } from "../services/eventService";
import { CreateEventDto, UpdateEventDto, EventQueryParams, PurchaseTicketDto } from "../models/Event";

const eventService = new EventService();

export class EventController {
  async createEvent(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateEventDto = req.body;
      const createdBy = req.user?.userId;

      // Validation
      if (!data.title || !data.title.trim()) {
        res.status(400).json({
          error: "Validation error",
          message: "Title is required",
        });
        return;
      }

      if (!data.event_date) {
        res.status(400).json({
          error: "Validation error",
          message: "Event date is required",
        });
        return;
      }

      if (!data.total_tickets || data.total_tickets < 1) {
        res.status(400).json({
          error: "Validation error",
          message: "Total tickets must be at least 1",
        });
        return;
      }

      if (data.price === undefined || data.price < 0) {
        res.status(400).json({
          error: "Validation error",
          message: "Price must be 0 or greater",
        });
        return;
      }

      const event = await eventService.createEvent(data, createdBy);
      res.status(201).json({
        message: "Event created successfully",
        data: event,
      });
    } catch (error: any) {
      console.error("Error creating event:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to create event",
      });
    }
  }

  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid event ID",
        });
        return;
      }

      const event = await eventService.getEventById(id);

      if (!event) {
        res.status(404).json({
          error: "Not found",
          message: "Event not found",
        });
        return;
      }

      res.status(200).json({
        message: "Event retrieved successfully",
        data: event,
      });
    } catch (error: any) {
      console.error("Error getting event:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to get event",
      });
    }
  }

  async listEvents(req: Request, res: Response): Promise<void> {
    try {
      const params: EventQueryParams = {
        status: req.query.status as string,
        venue: req.query.venue as string,
        from_date: req.query.from_date as string,
        to_date: req.query.to_date as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const result = await eventService.listEvents(params);

      res.status(200).json({
        message: "Events retrieved successfully",
        data: result.events,
        meta: {
          total: result.total,
          limit: params.limit || 50,
          offset: params.offset || 0,
        },
      });
    } catch (error: any) {
      console.error("Error listing events:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to list events",
      });
    }
  }

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid event ID",
        });
        return;
      }

      const data: UpdateEventDto = req.body;
      const event = await eventService.updateEvent(id, data);

      if (!event) {
        res.status(404).json({
          error: "Not found",
          message: "Event not found",
        });
        return;
      }

      res.status(200).json({
        message: "Event updated successfully",
        data: event,
      });
    } catch (error: any) {
      console.error("Error updating event:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to update event",
      });
    }
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid event ID",
        });
        return;
      }

      const deleted = await eventService.deleteEvent(id);

      if (!deleted) {
        res.status(404).json({
          error: "Not found",
          message: "Event not found",
        });
        return;
      }

      res.status(200).json({
        message: "Event deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting event:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to delete event",
      });
    }
  }

  async purchaseTickets(req: Request, res: Response): Promise<void> {
    try {
      const eventId = parseInt(req.params.eventId, 10);
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      if (isNaN(eventId)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid event ID",
        });
        return;
      }

      const data: PurchaseTicketDto = req.body;

      if (!data.quantity || data.quantity < 1) {
        res.status(400).json({
          error: "Validation error",
          message: "Quantity must be at least 1",
        });
        return;
      }

      const event = await eventService.purchaseTickets(eventId, data.quantity, userId);
      res.status(200).json({
        message: `Successfully purchased ${data.quantity} ticket(s)`,
        data: event,
      });
    } catch (error: any) {
      console.error("Error purchasing tickets:", error);
      const statusCode = error.message.includes("not found") ? 404 : 
                        error.message.includes("available") ? 400 : 500;
      res.status(statusCode).json({
        error: statusCode === 404 ? "Not found" : statusCode === 400 ? "Bad request" : "Internal server error",
        message: error.message || "Failed to purchase tickets",
      });
    }
  }
}

