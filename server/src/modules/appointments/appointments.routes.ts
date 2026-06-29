import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { createAppointmentSchema, updateAppointmentSchema } from './appointments.schema';
import { AppointmentsRepository } from './appointments.repository';
import { AppointmentsService } from './appointments.service';
import { createAppointmentsController } from './appointments.controller';

const repository = new AppointmentsRepository();
const service = new AppointmentsService(repository);
const controller = createAppointmentsController(service);

export const appointmentsRouter = Router();

// All appointment routes require authentication.
appointmentsRouter.use(authenticate);

// Managers and agents share full access to appointments.
appointmentsRouter.get('/', authorize('MANAGER', 'AGENT'), controller.getAll);
appointmentsRouter.get('/:id', authorize('MANAGER', 'AGENT'), controller.getById);
appointmentsRouter.post(
  '/',
  authorize('MANAGER', 'AGENT'),
  validateRequest(createAppointmentSchema),
  controller.create,
);
appointmentsRouter.patch(
  '/:id',
  authorize('MANAGER', 'AGENT'),
  validateRequest(updateAppointmentSchema),
  controller.update,
);
appointmentsRouter.delete('/:id', authorize('MANAGER', 'AGENT'), controller.remove);
