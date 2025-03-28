import express from 'express';
import authRoutes from './modules/auth/auth.route';
import healthRoutes from './modules/health/health.route';

const app = express();

app.use(express.json());
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);

export default app;
