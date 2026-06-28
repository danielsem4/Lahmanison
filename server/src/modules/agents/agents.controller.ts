import type { Request, Response, NextFunction } from 'express';
import type { AgentsService } from './agents.service';
import type { CreateAgentDto, UpdateAgentDto } from './agents.schema';
import { AppError } from '../../shared/errors/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id', 400);
  }
  return id;
}

export function createAgentsController(service: AgentsService) {
  return {
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const agents = await service.getAll();
        res.json(agents);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const agent = await service.getById(id);
        res.json(agent);
      } catch (err) {
        next(err);
      }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const result = await service.create(req.body as CreateAgentDto);
        res.status(201).json(result);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const agent = await service.update(id, req.body as UpdateAgentDto);
        res.json(agent);
      } catch (err) {
        next(err);
      }
    },

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        await service.remove(id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}
