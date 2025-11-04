import { Router } from "express";
import { EventController } from "../controllers/eventController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const eventController = new EventController();

// List events - public (no auth required)
router.get("/", (req, res) => eventController.listEvents(req, res));

// Get event by ID - public (no auth required)
router.get("/:id", (req, res) => eventController.getEvent(req, res));

// Create event - requires admin role
router.post("/", authenticate, authorize("admin"), (req, res) => eventController.createEvent(req, res));

// Update event - requires admin role
router.put("/:id", authenticate, authorize("admin"), (req, res) => eventController.updateEvent(req, res));

// Delete event - requires admin role
router.delete("/:id", authenticate, authorize("admin"), (req, res) => eventController.deleteEvent(req, res));

// Purchase tickets - requires authentication (any logged-in user)
router.post("/:eventId/purchase", authenticate, (req, res) => eventController.purchaseTickets(req, res));

export default router;

