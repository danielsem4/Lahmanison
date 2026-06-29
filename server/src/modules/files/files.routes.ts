import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { FilesRepository } from './files.repository';
import { FilesService } from './files.service';
import { createFilesController } from './files.controller';

const repository = new FilesRepository();
const service = new FilesService(repository);
const controller = createFilesController(service);

// Keep uploads in memory so the storage adapter (local now, S3 later) owns persistence.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Mounted at /api/patients — routes are nested under a patient id.
export const patientFilesRouter = Router();

patientFilesRouter.use(authenticate);

patientFilesRouter.get('/:patientId/files', authorize('MANAGER', 'AGENT'), controller.list);
patientFilesRouter.post(
  '/:patientId/files',
  authorize('MANAGER', 'AGENT'),
  upload.single('file'),
  controller.upload,
);
patientFilesRouter.get(
  '/:patientId/files/:fileId',
  authorize('MANAGER', 'AGENT'),
  controller.download,
);
patientFilesRouter.delete(
  '/:patientId/files/:fileId',
  authorize('MANAGER', 'AGENT'),
  controller.remove,
);
