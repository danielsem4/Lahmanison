import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { DocumentsRepository } from './documents.repository';
import { DocumentsService } from './documents.service';
import { createDocumentsController } from './documents.controller';

const repository = new DocumentsRepository();
const service = new DocumentsService(repository);
const controller = createDocumentsController(service);

// Keep uploads in memory so the storage adapter (local now, S3 later) owns persistence.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Mounted at /api/documents — a general, non-patient-scoped file area.
export const documentsRouter = Router();

documentsRouter.use(authenticate);

documentsRouter.get('/', authorize('MANAGER', 'AGENT'), controller.list);
documentsRouter.post('/', authorize('MANAGER', 'AGENT'), upload.single('file'), controller.upload);
documentsRouter.get('/:id', authorize('MANAGER', 'AGENT'), controller.download);
documentsRouter.delete('/:id', authorize('MANAGER', 'AGENT'), controller.remove);
