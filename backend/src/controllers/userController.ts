import { Request, Response } from "express";
import { UserService } from "../services/userService";
import { CreateUserDto, UpdateUserDto, UserQueryParams } from "../models/User";

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateUserDto = req.body;

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

      const user = await userService.createUser(data);
      res.status(201).json({
        message: "User created successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      const statusCode = error.message.includes("already exists") ? 409 : 500;
      res.status(statusCode).json({
        error: statusCode === 409 ? "Conflict" : "Internal server error",
        message: error.message || "Failed to create user",
      });
    }
  }

  async getUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid user ID",
        });
        return;
      }

      const user = await userService.getUserById(id);

      if (!user) {
        res.status(404).json({
          error: "Not found",
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        message: "User retrieved successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Error getting user:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to get user",
      });
    }
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const params: UserQueryParams = {
        role: req.query.role as string,
        is_active: req.query.is_active === "true" ? true : req.query.is_active === "false" ? false : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
      };

      const result = await userService.listUsers(params);

      res.status(200).json({
        message: "Users retrieved successfully",
        data: result.users,
        meta: {
          total: result.total,
          limit: params.limit || 50,
          offset: params.offset || 0,
        },
      });
    } catch (error: any) {
      console.error("Error listing users:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to list users",
      });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid user ID",
        });
        return;
      }

      const requesterRole = req.user?.role;
      const requesterId = req.user?.userId;
      const data: UpdateUserDto = req.body;

      // Non-admins cannot change role or is_active, even for themselves
      if (requesterRole !== "admin") {
        if (data.role !== undefined) {
          res.status(403).json({
            error: "Forbidden",
            message: "Only admins can change user roles",
          });
          return;
        }
        if (data.is_active !== undefined) {
          res.status(403).json({
            error: "Forbidden",
            message: "Only admins can change user active status",
          });
          return;
        }
      }

      const user = await userService.updateUser(id, data);

      if (!user) {
        res.status(404).json({
          error: "Not found",
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } catch (error: any) {
      console.error("Error updating user:", error);
      const statusCode = error.message.includes("taken") ? 409 : 500;
      res.status(statusCode).json({
        error: statusCode === 409 ? "Conflict" : "Internal server error",
        message: error.message || "Failed to update user",
      });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        res.status(400).json({
          error: "Validation error",
          message: "Invalid user ID",
        });
        return;
      }

      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        res.status(404).json({
          error: "Not found",
          message: "User not found",
        });
        return;
      }

      res.status(200).json({
        message: "User deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        error: "Internal server error",
        message: error.message || "Failed to delete user",
      });
    }
  }
}

