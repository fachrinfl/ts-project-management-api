import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret!);
    req.user = payload as { userId: string };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired access token' });
  }
};
