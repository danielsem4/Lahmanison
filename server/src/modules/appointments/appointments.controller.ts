import type { Request, Response, NextFunction } from 'express';
import type { AppointmentsService } from './appointments.service';
import type { CreateAppointmentDto, UpdateAppointmentDto } from './appointments.schema';
import { AppError } from '../../shared/errors/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id', 400);
  }
  return id;
}

export function createAppointmentsController(service: AppointmentsService) {
  return {
    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const rawPatientId = req.query['patientId'];
        const patientId = rawPatientId !== undefined ? Number(rawPatientId) : undefined;
        const appointments = await service.getAll(
          patientId !== undefined && Number.isInteger(patientId) && patientId > 0
            ? patientId
            : undefined,
        );
        res.json(appointments);
      } catch (err) {
        next(err);
      }
    },

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const appointment = await service.getById(id);
        res.json(appointment);
      } catch (err) {
        next(err);
      }
    },

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const appointment = await service.create(
          req.body as CreateAppointmentDto,
          req.currentUser?.userId,
        );
        res.status(201).json(appointment);
      } catch (err) {
        next(err);
      }
    },

    async update(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const appointment = await service.update(id, req.body as UpdateAppointmentDto);
        res.json(appointment);
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
