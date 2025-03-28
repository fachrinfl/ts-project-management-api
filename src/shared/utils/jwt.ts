import jwt, { Secret } from 'jsonwebtoken';
import { config } from '../../config/env';

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.accessSecret as Secret, {
    expiresIn: config.jwt.accessExpiresIn || '15m',
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, config.jwt.refreshSecret as Secret, {
    expiresIn: config.jwt.refreshExpiresIn || '7d',
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwt.accessSecret as Secret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwt.refreshSecret as Secret);
};
