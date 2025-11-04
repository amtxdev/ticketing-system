import { Request, Response } from "express";
import { TicketService } from "../services/ticketService";
import { CreateTicketDto, UpdateTicketDto, TicketQueryParams } from "../models/Ticket";

const ticketService = new TicketService();

export class TicketController {
  async createTicket(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTicketDto = req.body;

      // Validation
      if (!data.title || data.title.trim().length === 0) {
        res.status(400).json({
          error: "Validation error",
          message: "Title is required",
        });
        return;
      }

      const ticket = await ticketService.createTicket(data);
      res.status(201).json({
        message: "Ticket created successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to create ticket",
      });
    }
  }

  async getTicket(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid ticket ID",
        });
        return;
      }

      const ticket = await ticketService.getTicketById(id);

      if (!ticket) {
        res.status(404).json({
          error: "Not found",
          message: "Ticket not found",
        });
        return;
      }

      // Authorization check: Users can only view their own tickets, admins can view any
      if (userRole !== "admin" && ticket.user_id !== userId) {
        res.status(403).json({
          error: "Forbidden",
          message: "You can only view your own tickets",
        });
        return;
      }

      res.status(200).json({
        message: "Ticket retrieved successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Error getting ticket:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to get ticket",
      });
    }
  }

  async listTickets(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      const params: TicketQueryParams = {
        status: req.query.status as string,
        priority: req.query.priority as string,
        created_by: req.query.created_by as string,
        assigned_to: req.query.assigned_to as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      // If user is not admin, filter to only show their tickets
      if (userRole !== "admin") {
        params.user_id = userId;
      }

      const result = await ticketService.listTickets(params);

      res.status(200).json({
        message: "Tickets retrieved successfully",
        data: result.tickets,
        meta: {
          total: result.total,
          limit: params.limit || 50,
          offset: params.offset || 0,
        },
      });
    } catch (error: any) {
      console.error("Error listing tickets:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to list tickets",
      });
    }
  }

  async updateTicket(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid ticket ID",
        });
        return;
      }

      const data: UpdateTicketDto = req.body;
      const ticket = await ticketService.updateTicket(id, data);

      if (!ticket) {
        res.status(404).json({
          error: "Not found",
          message: "Ticket not found",
        });
        return;
      }

      res.status(200).json({
        message: "Ticket updated successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to update ticket",
      });
    }
  }

  async deleteTicket(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid ticket ID",
        });
        return;
      }

      const deleted = await ticketService.deleteTicket(id);

      if (!deleted) {
        res.status(404).json({
          error: "Not found",
          message: "Ticket not found",
        });
        return;
      }

      res.status(200).json({
        message: "Ticket deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to delete ticket",
      });
    }
  }
}

