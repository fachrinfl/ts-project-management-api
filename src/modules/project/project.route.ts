import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createTaskHandler,
  deleteTaskHandler,
  getTaskByIdHandler,
  getTasksHandler,
  updateTaskByIdHandler,
} from '../task/task.controller';
import {
  createProjectHandler,
  deleteProjectByIdHandler,
  getProjectByIdHandler,
  getProjectsHandler,
  updateProjectByIdHandler,
} from './project.controller';

const router = Router();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create new project
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, startDate, endDate, status]
 *             properties:
 *               name:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, on_hold, completed]
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *               teamEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *     responses:
 *       201:
 *         description: Project created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, createProjectHandler);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get list of projects
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, on_hold, completed]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/', authenticate, getProjectsHandler);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get project detail by ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the project
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project detail
 *       404:
 *         description: Project not found
 */
router.get('/:id', authenticate, getProjectByIdHandler);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project by ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, on_hold, completed]
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     url:
 *                       type: string
 *               teamEmails:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Update failed
 */
router.put('/:id', authenticate, updateProjectByIdHandler);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project by ID
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       400:
 *         description: Failed to delete project
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticate, deleteProjectByIdHandler);

/**
 * @swagger
 * /api/projects/tasks/user:
 *   get:
 *     summary: Get all tasks with filters and pagination
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in_progress, done]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [high, medium, low]
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/tasks/user', authenticate, getTasksHandler);

/**
 * @swagger
 * /api/projects/{projectId}/tasks:
 *   post:
 *     summary: Create a new task in a project
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startDate
 *               - endDate
 *               - status
 *               - priority
 *               - assigneeId
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               assigneeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/:projectId/tasks', authenticate, createTaskHandler);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   get:
 *     summary: Get task detail by ID
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task detail found
 *       404:
 *         description: Task not found
 */
router.get('/:projectId/tasks/:taskId', authenticate, getTaskByIdHandler);

/**
 * @swagger
 * /api/projects/{projectId}/tasks/{taskId}:
 *   put:
 *     summary: Update task by ID
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *               endDate:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in_progress, done]
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *               assigneeId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       400:
 *         description: Failed to update task
 */
router.put('/:projectId/tasks/:taskId', authenticate, updateTaskByIdHandler);

/**
 * @swagger
 * /api/projects/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task by ID
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         description: ID of the task to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Error during task deletion
 */
router.delete('/tasks/:taskId', authenticate, deleteTaskHandler);

export default router;
