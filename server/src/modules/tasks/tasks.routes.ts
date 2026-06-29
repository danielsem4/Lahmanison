import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { createTaskSchema, updateTaskSchema } from './tasks.schema';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';
import { createTasksController } from './tasks.controller';

const repository = new TasksRepository();
const service = new TasksService(repository);
const controller = createTasksController(service);

export const tasksRouter = Router();

// All task routes require authentication.
tasksRouter.use(authenticate);

// Managers and agents share full access to tasks.
tasksRouter.get('/', authorize('MANAGER', 'AGENT'), controller.getAll);
tasksRouter.get('/:id', authorize('MANAGER', 'AGENT'), controller.getById);
tasksRouter.post(
  '/',
  authorize('MANAGER', 'AGENT'),
  validateRequest(createTaskSchema),
  controller.create,
);
tasksRouter.patch(
  '/:id',
  authorize('MANAGER', 'AGENT'),
  validateRequest(updateTaskSchema),
  controller.update,
);
tasksRouter.delete('/:id', authorize('MANAGER', 'AGENT'), controller.remove);
