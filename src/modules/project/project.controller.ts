import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { createProject, getProjects } from './project.service';
import { CreateProjectSchema } from './project.validation';

export const createProjectHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const parsed = CreateProjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res
        .status(400)
        .json({ message: 'Validation failed', errors: parsed.error.format() });
      return;
    }

    const project = await createProject({
      ...parsed.data,
      createdById: req.user.userId,
    });
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: err.message || 'Failed to create project' });
  }
};

export const getProjectsHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, status, page = '1', perPage = '10' } = req.query;

    const result = await getProjects({
      userId: req.user.userId,
      name: name as string,
      status: status as 'active' | 'on_hold' | 'completed',
      page: Number(page),
      perPage: Number(perPage),
    });

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to get projects' });
  }
};
