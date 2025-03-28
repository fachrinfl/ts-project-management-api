import { Request, Response } from 'express';
import { checkCloudinaryHealth, checkDatabaseHealth } from './health.service';

export const healthCheck = async (req: Request, res: Response) => {
  const [dbHealthy, cloudinaryHealthy] = await Promise.all([
    checkDatabaseHealth(),
    checkCloudinaryHealth(),
  ]);

  const allHealthy = dbHealthy && cloudinaryHealthy;

  res.status(allHealthy ? 200 : 500).json({
    status: allHealthy ? 'OK' : 'ERROR',
    services: {
      server: true,
      database: dbHealthy,
      cloudinary: cloudinaryHealthy,
    },
    message: allHealthy
      ? 'Server, database, and cloudinary are healthy 🚀'
      : 'Some services are down ⚠️',
  });
};
