import { randomUUID } from 'crypto';
import { AppError } from '../../shared/errors/AppError';
import { fileStorage } from '../../shared/storage/storage';
import type { IDocumentsRepository, DocumentRecord } from './documents.repository';

export interface UploadDocumentInput {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export class DocumentsService {
  constructor(private readonly repository: IDocumentsRepository) {}

  async list(): Promise<DocumentRecord[]> {
    return this.repository.findAll();
  }

  async upload(file: UploadDocumentInput, uploaderId?: number): Promise<DocumentRecord> {
    const storageKey = `documents/${randomUUID()}`;
    await fileStorage.save(storageKey, file.buffer, file.mimeType);
    return this.repository.create({
      fileName: file.originalName,
      storageKey,
      mimeType: file.mimeType,
      size: file.size,
      uploadedById: uploaderId ?? null,
    });
  }

  async download(id: number): Promise<{ record: DocumentRecord; buffer: Buffer }> {
    const record = await this.get(id);
    const buffer = await fileStorage.read(record.storageKey);
    return { record, buffer };
  }

  async remove(id: number): Promise<void> {
    const record = await this.get(id);
    await fileStorage.delete(record.storageKey);
    await this.repository.delete(id);
  }

  private async get(id: number): Promise<DocumentRecord> {
    const record = await this.repository.findById(id);
    if (!record) {
      throw new AppError('File not found', 404);
    }
    return record;
  }
}
