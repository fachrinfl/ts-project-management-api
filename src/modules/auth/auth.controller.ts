import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import {
  generateAccessToken,
  verifyRefreshToken,
} from '../../shared/utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  loginUser,
  registerUser,
  updatePassword as updatePasswordService,
} from './auth.service';
import {
  LoginSchema,
  RegisterSchema,
  UpdatePasswordSchema,
} from './auth.validation';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.format();
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    const user = await registerUser(parsed.data);

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: 'Validation failed', errors: parsed.error.format() });
    }

    const result = await loginUser(parsed.data);

    res.status(200).json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Login failed' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ message: 'Missing refresh token' });

    const payload: any = verifyRefreshToken(refreshToken);
    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (!existingToken)
      return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccessToken = generateAccessToken({ userId: payload.userId });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res
      .status(401)
      .json({ message: 'Refresh token invalid or expired' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = UpdatePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: 'Validation failed', errors: parsed.error.format() });
    }

    await updatePasswordService({
      userId: req.user!.userId,
      ...parsed.data,
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: 'Missing refresh token' });

    await prisma.refreshToken.delete({ where: { token: refreshToken } });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Logout failed or token not found' });
  }
};
