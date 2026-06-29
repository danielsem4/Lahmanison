import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './modules/auth/auth.routes';
import { itemsRouter } from './modules/items/items.routes';
import { managersRouter } from './modules/managers/managers.routes';
import { agentsRouter } from './modules/agents/agents.routes';
import { patientsRouter } from './modules/patients/patients.routes';
import { patientFilesRouter } from './modules/files/files.routes';
import { appointmentsRouter } from './modules/appointments/appointments.routes';
import { tasksRouter } from './modules/tasks/tasks.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

const app = express();
const PORT = process.env['PORT'] || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env['CLIENT_URL'] || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Module routes
app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/managers', managersRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/patients', patientsRouter);
// Nested patient-file routes (/:patientId/files). Mounted after patientsRouter,
// whose single-segment routes (/:id) do not match the two-segment file paths.
app.use('/api/patients', patientFilesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/tasks', tasksRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
