import { Router } from "express";
import { TicketController } from "../controllers/ticketController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const ticketController = new TicketController();

// All ticket routes require authentication
router.use(authenticate);

// Create ticket
router.post("/", (req, res) => ticketController.createTicket(req, res));

// Get ticket by ID - users can view their own tickets, admins can view any
router.get("/:id", (req, res) => ticketController.getTicket(req, res));

// List all tickets - users see their own, admins see all
router.get("/", (req, res) => ticketController.listTickets(req, res));

// Update ticket - requires admin role
router.put("/:id", authorize("admin"), (req, res) => ticketController.updateTicket(req, res));

// Delete ticket - requires admin role
router.delete("/:id", authorize("admin"), (req, res) => ticketController.deleteTicket(req, res));

export default router;

