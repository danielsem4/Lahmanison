import { randomUUID } from 'crypto';
import { AppError } from '../../shared/errors/AppError';
import { fileStorage } from '../../shared/storage/storage';
import type { IFilesRepository, PatientFileRecord } from './files.repository';

export interface UploadFileInput {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}

export class FilesService {
  constructor(private readonly repository: IFilesRepository) {}

  async list(patientId: number): Promise<PatientFileRecord[]> {
    await this.ensurePatient(patientId);
    return this.repository.findByPatient(patientId);
  }

  async upload(
    patientId: number,
    file: UploadFileInput,
    uploaderId?: number,
  ): Promise<PatientFileRecord> {
    await this.ensurePatient(patientId);
    const storageKey = `patients/${patientId}/${randomUUID()}`;
    await fileStorage.save(storageKey, file.buffer, file.mimeType);
    return this.repository.create({
      patientId,
      fileName: file.originalName,
      storageKey,
      mimeType: file.mimeType,
      size: file.size,
      uploadedById: uploaderId ?? null,
    });
  }

  async download(
    patientId: number,
    fileId: number,
  ): Promise<{ record: PatientFileRecord; buffer: Buffer }> {
    const record = await this.getOwned(patientId, fileId);
    const buffer = await fileStorage.read(record.storageKey);
    return { record, buffer };
  }

  async remove(patientId: number, fileId: number): Promise<void> {
    const record = await this.getOwned(patientId, fileId);
    await fileStorage.delete(record.storageKey);
    await this.repository.delete(fileId);
  }

  private async ensurePatient(patientId: number): Promise<void> {
    if (!(await this.repository.patientExists(patientId))) {
      throw new AppError('Patient not found', 404);
    }
  }

  // Ensures the file exists AND belongs to the given patient (prevents cross-patient access).
  private async getOwned(patientId: number, fileId: number): Promise<PatientFileRecord> {
    const record = await this.repository.findById(fileId);
    if (!record || record.patientId !== patientId) {
      throw new AppError('File not found', 404);
    }
    return record;
  }
}
