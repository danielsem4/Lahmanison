import type { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';
import { AppError } from '../errors/AppError';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  // Upload errors (e.g. a file exceeding the size limit) are client mistakes → 400.
  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message;
    res.status(400).json({ message });
    return;
  }

  console.error('Unexpected error:', err);
  const detail = err instanceof Error ? err.message : String(err);
  res.status(500).json({ message: 'Internal server error', detail });
}
