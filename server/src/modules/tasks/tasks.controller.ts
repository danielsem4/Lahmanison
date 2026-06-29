import type { Request, Response, NextFunction } from 'express';
import type { TasksService } from './tasks.service';
import type { CreateTaskDto, UpdateTaskDto } from './tasks.schema';
import { AppError } from '../../shared/errors/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id', 400);
  }
  return id;
}

export function createTasksController(service: TasksService) {
  return {
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const tasks = await service.getAll();
        res.json(tasks);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const task = await service.getById(id);
        res.json(task);
      } catch (err) {
        next(err);
      }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const task = await service.create(req.body as CreateTaskDto, req.currentUser?.userId);
        res.status(201).json(task);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const task = await service.update(id, req.body as UpdateTaskDto);
        res.json(task);
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
