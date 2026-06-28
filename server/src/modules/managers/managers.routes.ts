import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { createManagerSchema, updateManagerSchema } from './managers.schema';
import { ManagersRepository } from './managers.repository';
import { ManagersService } from './managers.service';
import { createManagersController } from './managers.controller';

const repository = new ManagersRepository();
const service = new ManagersService(repository);
const controller = createManagersController(service);

export const managersRouter = Router();

// All manager routes require an authenticated ADMIN.
managersRouter.use(authenticate, authorize('ADMIN'));

managersRouter.get('/', controller.getAll);
managersRouter.get('/:id', controller.getById);
managersRouter.post('/', validateRequest(createManagerSchema), controller.create);
managersRouter.patch('/:id', validateRequest(updateManagerSchema), controller.update);
managersRouter.delete('/:id', controller.remove);
