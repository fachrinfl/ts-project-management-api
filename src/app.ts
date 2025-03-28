import express from 'express';
import healthRoutes from './modules/health/health.route';

const app = express();

app.use(express.json());
app.use('/api/health', healthRoutes);

export default app;
