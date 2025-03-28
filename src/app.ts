import express from 'express';
import analyticsRoutes from './modules/analytics/analytics.route';
import authRoutes from './modules/auth/auth.route';
import healthRoutes from './modules/health/health.route';
import projectRoutes from './modules/project/project.route';
import uploadRoutes from './modules/upload/upload.route';
import userRoutes from './modules/user/user.route';

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger';

const app = express();

app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
