import { Router } from "express";
import { UserController } from "../controllers/userController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
const userController = new UserController();

// All user routes require authentication
router.use(authenticate);

// List users (admin only)
router.get("/", authorize("admin"), (req, res) => userController.listUsers(req, res));

// Get user by ID (users can view their own, admins can view any)
router.get("/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const requesterId = req.user?.userId;
  const requesterRole = req.user?.role;

  // Users can only view their own profile, admins can view any
  if (requesterRole !== "admin" && userId !== requesterId) {
    return res.status(403).json({
      error: "Forbidden",
      message: "You can only view your own profile",
    });
  }

  return userController.getUser(req, res);
});

// Create user (admin only)
router.post("/", authorize("admin"), (req, res) => userController.createUser(req, res));

// Update user (users can update their own, admins can update any)
router.put("/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const requesterId = req.user?.userId;
  const requesterRole = req.user?.role;

  // Users can only update their own profile, admins can update any
  if (requesterRole !== "admin" && userId !== requesterId) {
    return res.status(403).json({
      error: "Forbidden",
      message: "You can only update your own profile",
    });
  }

  return userController.updateUser(req, res);
});

// Delete user (admin only)
router.delete("/:id", authorize("admin"), (req, res) => userController.deleteUser(req, res));

export default router;

