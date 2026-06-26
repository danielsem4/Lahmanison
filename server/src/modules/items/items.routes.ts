import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { createItemSchema, updateItemSchema } from './items.schema';
import { ItemsRepository } from './items.repository';
import { ItemsService } from './items.service';
import { createItemsController } from './items.controller';

const repository = new ItemsRepository();
const service = new ItemsService(repository);
const controller = createItemsController(service);

export const itemsRouter = Router();

// All item routes require authentication
itemsRouter.use(authenticate);

itemsRouter.get('/', controller.getAll);
itemsRouter.get('/:id', controller.getById);
itemsRouter.post('/', validateRequest(createItemSchema), controller.create);
itemsRouter.patch('/:id', validateRequest(updateItemSchema), controller.update);
itemsRouter.delete('/:id', controller.remove);
