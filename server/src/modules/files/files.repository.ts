import prisma from '../../lib/prisma';

export interface PatientFileRecord {
  id: number;
  patientId: number;
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedById: number | null;
  createdAt: Date;
}

export interface CreatePatientFileData {
  patientId: number;
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedById?: number | null;
}

export interface IFilesRepository {
  findByPatient(patientId: number): Promise<PatientFileRecord[]>;
  findById(id: number): Promise<PatientFileRecord | null>;
  create(data: CreatePatientFileData): Promise<PatientFileRecord>;
  delete(id: number): Promise<void>;
  patientExists(patientId: number): Promise<boolean>;
}

export class FilesRepository implements IFilesRepository {
  async findByPatient(patientId: number): Promise<PatientFileRecord[]> {
    return prisma.patientFile.findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<PatientFileRecord | null> {
    return prisma.patientFile.findUnique({ where: { id } });
  }

  async create(data: CreatePatientFileData): Promise<PatientFileRecord> {
    return prisma.patientFile.create({ data });
  }

  async delete(id: number): Promise<void> {
    await prisma.patientFile.delete({ where: { id } });
  }

  async patientExists(patientId: number): Promise<boolean> {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    return patient !== null;
  }
}
