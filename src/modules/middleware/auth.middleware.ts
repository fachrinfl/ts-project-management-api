import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '../../config/env';

export interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  try {
    const payload = jwt.verify(token, config.jwt.accessSecret!) as JwtPayload;
    req.user = { userId: payload.userId };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
