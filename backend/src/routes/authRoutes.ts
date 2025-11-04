import { Router, Request, Response, NextFunction } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();
const authController = new AuthController();

/**
 * Middleware to protect admin registration endpoint
 * Requires ADMIN_REGISTRATION_SECRET in request body or header
 */
function protectAdminRegistration(req: Request, res: Response, next: NextFunction): void {
  const ADMIN_SECRET = process.env.ADMIN_REGISTRATION_SECRET;
  
  // If no secret is configured, disable admin registration
  if (!ADMIN_SECRET) {
    res.status(403).json({
      error: "Forbidden",
      message: "Admin registration is disabled",
    });
    return;
  }

  const providedSecret = req.body.secret || req.headers["x-admin-secret"];

  if (!providedSecret || providedSecret !== ADMIN_SECRET) {
    res.status(403).json({
      error: "Forbidden",
      message: "Invalid admin registration secret",
    });
    return;
  }

  // Remove secret from body before passing to controller
  delete req.body.secret;
  next();
}

router.post("/register", (req, res) => authController.register(req, res));
router.post("/register-admin", protectAdminRegistration, (req, res) => authController.registerAdmin(req, res));
router.post("/login", (req, res) => authController.login(req, res));
router.post("/logout", (req, res) => authController.logout(req, res));

export default router;

