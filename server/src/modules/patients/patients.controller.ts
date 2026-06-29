import type { Request, Response, NextFunction } from 'express';
import type { PatientsService } from './patients.service';
import type { CreatePatientDto, UpdatePatientDto } from './patients.schema';
import { AppError } from '../../shared/errors/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id', 400);
  }
  return id;
}

export function createPatientsController(service: PatientsService) {
  return {
    async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const patients = await service.getAll();
        res.json(patients);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const patient = await service.getById(id);
        res.json(patient);
      } catch (err) {
        next(err);
      }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const patient = await service.create(
          req.body as CreatePatientDto,
          req.currentUser?.userId,
        );
        res.status(201).json(patient);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const patient = await service.update(id, req.body as UpdatePatientDto);
        res.json(patient);
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
