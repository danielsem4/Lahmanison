import type { Request, Response, NextFunction } from 'express';
import type { ItemsService } from './items.service';
import type { CreateItemDto, UpdateItemDto } from './items.schema';
import { AppError } from '../../shared/errors/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id', 400);
  }
  return id;
}

export function createItemsController(service: ItemsService) {
  return {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const items = await service.getAll(req.currentUser!.userId);
        res.json(items);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const item = await service.getById(id, req.currentUser!.userId);
        res.json(item);
      } catch (err) {
        next(err);
      }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const item = await service.create(req.currentUser!.userId, req.body as CreateItemDto);
        res.status(201).json(item);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const item = await service.update(id, req.currentUser!.userId, req.body as UpdateItemDto);
        res.json(item);
      } catch (err) {
        next(err);
      }
    },

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        await service.remove(id, req.currentUser!.userId);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}
