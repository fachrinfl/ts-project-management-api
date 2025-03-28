import { PrismaClient } from '@prisma/client';
import cloudinary from '../../config/cloudinary';

const prisma = new PrismaClient();

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

export const checkCloudinaryHealth = async (): Promise<boolean> => {
  try {
    const result = await cloudinary.api.ping();
    return result.status === 'ok';
  } catch (error) {
    console.error('❌ Cloudinary health check failed:', error);
    return false;
  }
};
