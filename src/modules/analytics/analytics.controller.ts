import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  getProjectAnalytics,
  getTopProjectsByUserId,
  getWeeklyProjectStatus,
} from './analytics.service';

export const getProjectAnalyticsHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id: projectId } = req.params;

    const result = await getProjectAnalytics(projectId);
    res.status(200).json(result);
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || 'Failed to fetch analytics' });
  }
};

export const getWeeklyProjectStatusHandler = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const result = await getWeeklyProjectStatus(projectId);
    res.status(200).json(result);
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || 'Failed to get weekly status' });
  }
};

export const getTopProjectsHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const result = await getTopProjectsByUserId(req.user.userId);
    res.status(200).json(result);
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || 'Failed to get top projects' });
  }
};
