import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createProject,
  deleteProjectById,
  getProjectById,
  getProjects,
  updateProjectById,
} from './project.service';
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

export const getProjectByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const project = await getProjectById(id);

    res.status(200).json({ data: project });
  } catch (err: any) {
    res.status(404).json({ message: err.message || 'Project not found' });
  }
};

export const updateProjectByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = req.body;

    const project = await updateProjectById(id, body);

    res.status(200).json({
      message: 'Project updated successfully',
      data: project,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Update failed' });
  }
};

export const deleteProjectByIdHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteProjectById(id);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (err: any) {
    res
      .status(400)
      .json({ message: err.message || 'Failed to delete project' });
  }
};
