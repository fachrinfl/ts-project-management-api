import jwt, { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { config } from '../../config/env';

export const generateAccessToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiresIn as StringValue,
  };

  return jwt.sign(payload, config.jwt.accessSecret!, options);
};

export const generateRefreshToken = (payload: object): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiresIn as StringValue,
  };

  return jwt.sign(payload, config.jwt.refreshSecret!, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, config.jwt.accessSecret!);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, config.jwt.refreshSecret!);
};
