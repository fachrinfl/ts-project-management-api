import { Router } from 'express';
import { searchUsersByEmailHandler } from './user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Autocomplete user by email
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Email keyword to search
 *     responses:
 *       200:
 *         description: List of matched users
 *       400:
 *         description: Query too short or missing
 */
router.get('/search', authenticate, searchUsersByEmailHandler);

export default router;
