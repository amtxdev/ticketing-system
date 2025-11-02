import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

// Protected route (requires authentication)
// Note: logout can be public or protected depending on implementation
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;

