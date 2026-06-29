import type { Request, Response, NextFunction } from 'express';
import type { FilesService } from './files.service';
import { AppError } from '../../shared/errors/AppError';

function parseId(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('Invalid id', 400);
  }
  return id;
}

// Files are served from the app's own origin, so rendering them inline with a
// user-controlled mime type is a stored-XSS vector (e.g. an uploaded text/html
// or image/svg+xml file could run scripts against the session cookie). Only
// allow inline rendering for types that browsers treat as inert documents/media.
function canRenderInline(mimeType: string): boolean {
  return (
    mimeType === 'application/pdf' ||
    mimeType === 'text/plain' ||
    (mimeType.startsWith('image/') && mimeType !== 'image/svg+xml')
  );
}

export function createFilesController(service: FilesService) {
  return {
    async list(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const patientId = parseId(req.params['patientId']);
        const files = await service.list(patientId);
        res.json(files);
      } catch (err) {
        next(err);
      }
    },

    async upload(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const patientId = parseId(req.params['patientId']);
        const file = req.file;
        if (!file) {
          throw new AppError('A file is required', 400);
        }
        const record = await service.upload(
          patientId,
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
        const patientId = parseId(req.params['patientId']);
        const fileId = parseId(req.params['fileId']);
        const { record, buffer } = await service.download(patientId, fileId);
        const encoded = encodeURIComponent(record.fileName);
        const wantsInline = req.query['disposition'] === 'inline';
        const disposition =
          wantsInline && canRenderInline(record.mimeType) ? 'inline' : 'attachment';
        res.setHeader('Content-Type', record.mimeType);
        // Never let the browser sniff a different (executable) type than declared.
        res.setHeader('X-Content-Type-Options', 'nosniff');
        if (disposition === 'inline') {
          // Sandbox inline content so it cannot run scripts or reach the session.
          res.setHeader('Content-Security-Policy', 'sandbox');
        }
        res.setHeader(
          'Content-Disposition',
          `${disposition}; filename="${encoded}"; filename*=UTF-8''${encoded}`,
        );
        res.send(buffer);
      } catch (err) {
        next(err);
      }
    },

    async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const patientId = parseId(req.params['patientId']);
        const fileId = parseId(req.params['fileId']);
        await service.remove(patientId, fileId);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },
  };
}
