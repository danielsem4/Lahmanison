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

// All patient routes require an authenticated MANAGER.
patientsRouter.use(authenticate, authorize('MANAGER'));

patientsRouter.get('/', controller.getAll);
patientsRouter.get('/:id', controller.getById);
patientsRouter.post('/', validateRequest(createPatientSchema), controller.create);
patientsRouter.patch('/:id', validateRequest(updatePatientSchema), controller.update);
patientsRouter.delete('/:id', controller.remove);
