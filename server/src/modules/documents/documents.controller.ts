import type { Request, Response, NextFunction } from 'express';
import type { DocumentsService } from './documents.service';
import { AppError } from '../../shared/errors/AppError';
import { sendFileResponse } from '../../shared/storage/fileResponse';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id', 400);
  }
  return id;
}

export function createDocumentsController(service: DocumentsService) {
  return {
    async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        res.json(await service.list());
      } catch (err) {
        next(err);
      }
    },

    async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const file = req.file;
        if (!file) {
          throw new AppError('A file is required', 400);
        }
        const record = await service.upload(
          {
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            buffer: file.buffer,
          },
          req.currentUser?.userId,
        );
        res.status(201).json(record);
      } catch (err) {
        next(err);
      }
    },

    async download(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = parseId(req.params['id']);
        const { record, buffer } = await service.download(id);
        sendFileResponse(res, record, buffer, req.query['disposition'] === 'inline');
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
