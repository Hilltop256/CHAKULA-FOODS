import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  register,
  login,
  refreshTokens,
  logout,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/authController';

const router = Router();

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
    phone: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshTokens);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;
