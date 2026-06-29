import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/authenticate';
import { authorize } from '../../shared/middlewares/authorize';
import { validateRequest } from '../../shared/middlewares/validateRequest';
import { createAgentSchema, updateAgentSchema } from './agents.schema';
import { AgentsRepository } from './agents.repository';
import { AgentsService } from './agents.service';
import { createAgentsController } from './agents.controller';

const repository = new AgentsRepository();
const service = new AgentsService(repository);
const controller = createAgentsController(service);

export const agentsRouter = Router();

// All agent routes require an authenticated MANAGER.
agentsRouter.use(authenticate, authorize('MANAGER'));

agentsRouter.get('/', controller.getAll);
agentsRouter.get('/:id', controller.getById);
agentsRouter.post('/', validateRequest(createAgentSchema), controller.create);
agentsRouter.patch('/:id', validateRequest(updateAgentSchema), controller.update);
agentsRouter.delete('/:id', controller.remove);
