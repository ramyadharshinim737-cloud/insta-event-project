// Auth routes
import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/google", AuthController.googleLogin);
router.post("/verify-otp", AuthController.verifyOTP);
router.post("/resend-otp", AuthController.resendOTP);

export default router;
