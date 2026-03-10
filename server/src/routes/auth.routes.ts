import { Router } from "express";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  refreshToken,
  register,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPassword,
  resetPasswordSchema
} from "../controllers/authController";
import { validate } from "../middleware/validate";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.get("/me", authMiddleware, getMe);

export default router;

