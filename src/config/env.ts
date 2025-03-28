import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  apiBaseUrl: process.env.API_BASE_URL || '',
  databaseUrl: process.env.DATABASE_URL || '',
  cloudinaryUrl: process.env.CLOUDINARY_URL || '',
  jwt: {
    accessSecret: process.env.JWT_SECRET || 'default_access_secret',
    accessExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
};
