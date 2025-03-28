import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';
import { uploadFile } from './upload.controller';

const router = Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload file to Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               folder:
 *                 type: string
 *                 description: Optional folder name in Cloudinary
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     public_id:
 *                       type: string
 *                     resource_type:
 *                       type: string
 *       400:
 *         description: File missing
 *       500:
 *         description: Upload failed
 */
router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
