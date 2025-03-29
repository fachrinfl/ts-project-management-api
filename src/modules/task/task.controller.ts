import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTasksByProjectId,
  updateTaskById,
} from './task.service';

export const createTaskHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const task = await createTask({
      ...req.body,
      projectId,
      createdById: req.user?.userId,
    });

    res.status(201).json({
      message: 'Task created successfully',
      data: task,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Task creation failed' });
  }
};

export const getTasksHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    console.log(req.user);
    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      projectId,
      status,
      priority,
      page = '1',
      perPage = '10',
    } = req.query;

    const tasks = await getAllTasks({
      userId: req.user.userId,
      projectId: projectId as string,
      status: status as 'todo' | 'in_progress' | 'done',
      priority: priority as 'high' | 'medium' | 'low',
      page: parseInt(page as string, 10),
      perPage: parseInt(perPage as string, 10),
    });

    res.status(200).json(tasks);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Failed to fetch tasks' });
  }
};

type Params = {
  projectId: string;
  taskId: string;
};

export const getTaskByIdHandler = async (
  req: Request<Params>,
  res: Response,
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const task = await getTaskById(taskId);

    res.status(200).json({ data: task });
  } catch (err: any) {
    res.status(404).json({ message: err.message || 'Task not found' });
  }
};

type ParamsTaskUpdate = {
  projectId: string;
  taskId: string;
};

export const updateTaskByIdHandler = async (
  req: Request<ParamsTaskUpdate>,
  res: Response,
): Promise<void> => {
  try {
    const { taskId } = req.params;
    const updated = await updateTaskById(taskId, req.body);

    res.status(200).json({
      message: 'Task updated successfully',
      data: updated,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to update task' });
  }
};

export const deleteTaskHandler = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { taskId } = req.params;

    if (!req.user?.userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await deleteTask({ taskId, userId: req.user.userId });

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to delete task' });
  }
};

export const getTasksByProjectHandler = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, priority, page = '1', perPage = '10' } = req.query;

    const tasks = await getTasksByProjectId({
      projectId,
      status: status as 'todo' | 'in_progress' | 'done',
      priority: priority as 'high' | 'medium' | 'low',
      page: parseInt(page as string, 10),
      perPage: parseInt(perPage as string, 10),
    });

    res.status(200).json(tasks);
  } catch (err: any) {
    res.status(400).json({ message: err.message || 'Failed to fetch tasks' });
  }
};
