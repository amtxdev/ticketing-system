import { Router } from "express";
import { TicketController } from "../controllers/ticketController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const ticketController = new TicketController();

// Create ticket
router.post("/", authenticate, (req, res) => ticketController.createTicket(req, res));

// Get ticket by ID
router.get("/:id", (req, res) => ticketController.getTicket(req, res));

// List all tickets (with optional query params)
router.get("/", (req, res) => ticketController.listTickets(req, res));

// Update ticket - requires admin role
router.put("/:id", authenticate, authorize("admin"), (req, res) => ticketController.updateTicket(req, res));

// Delete ticket - requires admin role
router.delete("/:id", authenticate, authorize("admin"), (req, res) => ticketController.deleteTicket(req, res));

export default router;

