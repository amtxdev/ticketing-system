import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { RegisterDto, LoginDto } from "../models/User";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterDto = req.body;

      // Validation
      if (!data.email || !data.email.trim()) {
        res.status(400).json({
          error: "Validation error",
          message: "Email is required",
        });
        return;
      }

      if (!data.password || data.password.length < 6) {
        res.status(400).json({
          error: "Validation error",
          message: "Password must be at least 6 characters",
        });
        return;
      }

      const result = await authService.register(data);
      res.status(201).json({
        message: "User registered successfully",
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error("Error registering user:", error);
      const statusCode = error.message.includes("already exists") ? 409 : 500;
      res.status(statusCode).json({
        error: statusCode === 409 ? "Conflict" : "Internal server error",
        message: error.message || "Failed to register user",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDto = req.body;

      // Validation
      if (!data.email || !data.email.trim()) {
        res.status(400).json({
          error: "Validation error",
          message: "Email is required",
        });
        return;
      }

      if (!data.password) {
        res.status(400).json({
          error: "Validation error",
          message: "Password is required",
        });
        return;
      }

      const result = await authService.login(data);
      res.status(200).json({
        message: "Login successful",
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error("Error logging in:", error);
      const statusCode = error.message.includes("Invalid") || error.message.includes("inactive") ? 401 : 500;
      res.status(statusCode).json({
        error: statusCode === 401 ? "Unauthorized" : "Internal server error",
        message: error.message || "Failed to login",
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "") || "";
      await authService.logout(token);
      res.status(200).json({
        message: "Logout successful",
      });
    } catch (error: any) {
      console.error("Error logging out:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to logout",
      });
    }
  }
}

