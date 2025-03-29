import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getProjectAnalyticsHandler,
  getTopProjectsHandler,
  getWeeklyProjectStatusHandler,
} from './analytics.controller';

const router = Router();

/**
 * @swagger
 * /api/analytics/project/{id}:
 *   get:
 *     summary: Get project analytics by ID
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project analytics summary
 *       400:
 *         description: Project not found
 */
router.get('/project/:id', authenticate, getProjectAnalyticsHandler);

/**
 * @swagger
 * /api/analytics/project/{id}/weekly-status:
 *   get:
 *     summary: Get weekly task status for a project
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Project ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Weekly status breakdown
 */
router.get(
  '/project/:id/weekly-status',
  authenticate,
  getWeeklyProjectStatusHandler,
);

/**
 * @swagger
 * /api/analytics/user/top-projects:
 *   get:
 *     summary: Get top 5 active projects for the current user
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of top projects
 */
router.get('/user/top-projects', authenticate, getTopProjectsHandler);

export default router;
