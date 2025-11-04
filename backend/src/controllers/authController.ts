import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { RegisterDto, LoginDto } from "../models/User";
import {
  validateAndSanitizeEmail,
  validateStringLength,
  isValidPassword,
} from "../utils/validation";

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterDto = req.body;

      // Validate and sanitize email
      const emailValidation = validateAndSanitizeEmail(data.email);
      if (!emailValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: emailValidation.message || "Invalid email",
        });
        return;
      }

      // Validate password
      const passwordValidation = isValidPassword(data.password);
      if (!passwordValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: passwordValidation.message || "Invalid password",
        });
        return;
      }

      // Validate first name
      const firstNameValidation = validateStringLength(data.first_name, 1, 100, "First name");
      if (!firstNameValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: firstNameValidation.message,
        });
        return;
      }

      // Validate last name
      const lastNameValidation = validateStringLength(data.last_name, 1, 100, "Last name");
      if (!lastNameValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: lastNameValidation.message,
        });
        return;
      }

      // Use sanitized email
      const sanitizedData: RegisterDto = {
        ...data,
        email: emailValidation.sanitized!,
      };

      const result = await authService.register(sanitizedData, req);
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

  async registerAdmin(req: Request, res: Response): Promise<void> {
    try {
      const data: RegisterDto = req.body;

      // Validate and sanitize email
      const emailValidation = validateAndSanitizeEmail(data.email);
      if (!emailValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: emailValidation.message || "Invalid email",
        });
        return;
      }

      // Validate password
      const passwordValidation = isValidPassword(data.password);
      if (!passwordValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: passwordValidation.message || "Invalid password",
        });
        return;
      }

      // Validate first name
      const firstNameValidation = validateStringLength(data.first_name, 1, 100, "First name");
      if (!firstNameValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: firstNameValidation.message,
        });
        return;
      }

      // Validate last name
      const lastNameValidation = validateStringLength(data.last_name, 1, 100, "Last name");
      if (!lastNameValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: lastNameValidation.message,
        });
        return;
      }

      // Use sanitized email
      const sanitizedData: RegisterDto = {
        ...data,
        email: emailValidation.sanitized!,
      };

      const result = await authService.registerAdmin(sanitizedData, req);
      res.status(201).json({
        message: "Admin registered successfully",
        data: result.user,
        token: result.token,
      });
    } catch (error: any) {
      console.error("Error registering admin:", error);
      const statusCode = error.message.includes("already exists") ? 409 : 500;
      res.status(statusCode).json({
        error: statusCode === 409 ? "Conflict" : "Internal server error",
        message: error.message || "Failed to register admin",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDto = req.body;

      // Validate and sanitize email
      const emailValidation = validateAndSanitizeEmail(data.email);
      if (!emailValidation.valid) {
        res.status(400).json({
          error: "Validation error",
          message: emailValidation.message || "Invalid email",
        });
        return;
      }

      if (!data.password || data.password.trim().length === 0) {
        res.status(400).json({
          error: "Validation error",
          message: "Password is required",
        });
        return;
      }

      // Use sanitized email
      const sanitizedData: LoginDto = {
        email: emailValidation.sanitized!,
        password: data.password,
      };

      const result = await authService.login(sanitizedData, req);
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
