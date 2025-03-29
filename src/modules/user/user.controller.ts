import { Response } from 'express';

import { AuthRequest } from '../middleware/auth.middleware';
import { searchUsersByEmail } from './user.service';

export const searchUsersByEmailHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const keyword = req.query.q as string;

    if (!keyword || keyword.trim().length < 2) {
      res.status(400).json({ message: 'Query too short or missing' });
      return;
    }

    const users = await searchUsersByEmail(keyword, req.user!.userId);

    res.status(200).json({ data: users });
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Search failed' });
  }
};
