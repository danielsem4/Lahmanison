import { env } from './lib/env';

import path from 'path';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { authRouter } from './modules/auth/auth.routes';
import { itemsRouter } from './modules/items/items.routes';
import { managersRouter } from './modules/managers/managers.routes';
import { agentsRouter } from './modules/agents/agents.routes';
import { patientsRouter } from './modules/patients/patients.routes';
import { patientFilesRouter } from './modules/files/files.routes';
import { documentsRouter } from './modules/documents/documents.routes';
import { appointmentsRouter } from './modules/appointments/appointments.routes';
import { tasksRouter } from './modules/tasks/tasks.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

const app = express();

// Behind a TLS-terminating proxy (Render/Nginx/etc.) so `secure` cookies and
// req.protocol are derived from X-Forwarded-* headers.
app.set('trust proxy', 1);

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        // Radix UI sets inline styles for positioning; allow them for the SPA.
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'blob:'],
      },
    },
  }),
);
// CORS only when a separate client origin is configured (dev, or split hosting).
// The single-origin production deployment serves the SPA itself, so no CORS.
if (env.clientUrl) {
  app.use(cors({ origin: env.clientUrl, credentials: true }));
}
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
app.use('/api/documents', documentsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/tasks', tasksRouter);

// In production the API also serves the built SPA so the whole app is one
// origin. Static assets first, then a catch-all that returns index.html for
// client-side routes (anything that is a GET and not under /api).
if (env.isProd) {
  const clientDist = env.clientDistPath || path.resolve(process.cwd(), 'public');
  app.use(express.static(clientDist));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`);
});

export default app;
