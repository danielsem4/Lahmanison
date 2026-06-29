import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { createPatientSchema, updatePatientSchema } from './patients.schema';
import { PatientsRepository } from './patients.repository';
import { PatientsService } from './patients.service';
import { createPatientsController } from './patients.controller';

const repository = new PatientsRepository();
const service = new PatientsService(repository);
const controller = createPatientsController(service);

export const patientsRouter = Router();

// All patient routes require authentication.
patientsRouter.use(authenticate);

patientsRouter.get('/', authorize('MANAGER'), controller.getAll);
patientsRouter.get('/:id', authorize('MANAGER'), controller.getById);
// Agents may create patients too, so they are attributed as the creator.
patientsRouter.post(
  '/',
  authorize('MANAGER', 'AGENT'),
  validateRequest(createPatientSchema),
  controller.create,
);
patientsRouter.patch(
  '/:id',
  authorize('MANAGER'),
  validateRequest(updatePatientSchema),
  controller.update,
);
patientsRouter.delete('/:id', authorize('MANAGER'), controller.remove);
