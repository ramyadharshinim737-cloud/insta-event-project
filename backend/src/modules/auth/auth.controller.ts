// Auth API controllers
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterRequest, LoginRequest, GoogleLoginRequest } from "./auth.types";

export class AuthController {
  // POST /api/auth/register
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password } = req.body as RegisterRequest;

      // Validation
      if (!name || !email || !password) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const result = await AuthService.register({ name, email, password });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // POST /api/auth/login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body as LoginRequest;

      // Validation
      if (!email || !password) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const result = await AuthService.login({ email, password });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  // POST /api/auth/google
  static async googleLogin(req: Request, res: Response): Promise<void> {
    try {
      const { idToken } = req.body as GoogleLoginRequest;

      // Validation
      if (!idToken) {
        res.status(400).json({ error: "Missing ID token" });
        return;
      }

      const result = await AuthService.googleLogin({ idToken });
      res.status(200).json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  // POST /api/auth/verify-otp
  static async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;

      // Validation
      if (!email || !code) {
        res.status(400).json({ error: "Missing email or OTP code" });
        return;
      }

      const result = await AuthService.verifyOTP(email, code);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // POST /api/auth/resend-otp
  static async resendOTP(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Validation
      if (!email) {
        res.status(400).json({ error: "Missing email" });
        return;
      }

      await AuthService.resendOTP(email);
      res.status(200).json({ message: "OTP sent successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
