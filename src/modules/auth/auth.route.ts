import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  login,
  logout,
  refreshAccessToken,
  register,
  updatePassword,
} from './auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);
router.put('/update-password', authenticate, updatePassword);

export default router;
