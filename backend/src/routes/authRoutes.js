import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  refreshToken,
  updateProfile
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema
} from '../validators/authValidators.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validateBody(registerSchema), register);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/refresh', refreshToken);
router.patch('/profile', authenticate, validateBody(updateProfileSchema), updateProfile);

export default router;
