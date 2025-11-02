import { Router } from "express";
import { TicketController } from "../controllers/ticketController";

const router = Router();
const ticketController = new TicketController();

// Create ticket
router.post("/", (req, res) => ticketController.createTicket(req, res));

// Get ticket by ID
router.get("/:id", (req, res) => ticketController.getTicket(req, res));

// List all tickets (with optional query params)
router.get("/", (req, res) => ticketController.listTickets(req, res));

// Update ticket
router.put("/:id", (req, res) => ticketController.updateTicket(req, res));

// Delete ticket
router.delete("/:id", (req, res) => ticketController.deleteTicket(req, res));

export default router;

