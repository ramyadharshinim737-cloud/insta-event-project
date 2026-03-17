// JWT authentication middleware
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../modules/auth/auth.service";

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Missing or invalid token" });
      return;
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = AuthService.verifyToken(token);
    req.userId = payload.userId;

    next();
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
