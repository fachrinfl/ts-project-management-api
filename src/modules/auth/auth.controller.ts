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
  updateProfile as updateProfileService,
} from './auth.service';
import {
  LoginSchema,
  RegisterSchema,
  UpdatePasswordSchema,
  UpdateProfileSchema,
} from './auth.validation';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: 'Validation failed', errors: parsed.error.format() });
      return;
    }

    const user = await registerUser(parsed.data);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: 'Validation failed', errors: parsed.error.format() });
      return;
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

export const refreshAccessToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Missing refresh token' });
      return;
    }

    const payload: any = verifyRefreshToken(refreshToken);

    const existingToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!existingToken) {
      res.status(401).json({ message: 'Invalid refresh token' });
      return;
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId });

    res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(401).json({ message: 'Refresh token invalid or expired' });
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const parsed = UpdatePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: 'Validation failed', errors: parsed.error.format() });
      return;
    }

    await updatePasswordService({
      userId: req.user.userId,
      ...parsed.data,
    });

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Missing refresh token' });
      return;
    }

    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Logout failed or token not found' });
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user.userId) {
      res.status(401).json({ message: 'Unauthorized: no userId in token' });
      return;
    }

    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parsed.error.format(),
      });
      return;
    }

    const user = await updateProfileService({
      userId: req.user.userId,
      ...parsed.data,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Update failed' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        photo: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to get profile' });
  }
};
