import prisma from '../../lib/prisma';
import { PatientStatus } from '@prisma/client';

export interface PatientRecord {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  hasImage: boolean;
  status: PatientStatus;
  statusNote: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePatientData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  hasImage: boolean;
  status: PatientStatus;
  statusNote?: string | null;
}

export interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  age?: number;
  hasImage?: boolean;
  status?: PatientStatus;
  statusNote?: string | null;
}

export interface IPatientsRepository {
  findAll(): Promise<PatientRecord[]>;
  findById(id: number): Promise<PatientRecord | null>;
  create(data: CreatePatientData): Promise<PatientRecord>;
  update(id: number, data: UpdatePatientData): Promise<PatientRecord>;
  delete(id: number): Promise<void>;
}

export class PatientsRepository implements IPatientsRepository {
  async findAll(): Promise<PatientRecord[]> {
    return prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<PatientRecord | null> {
    return prisma.patient.findUnique({ where: { id } });
  }

  async create(data: CreatePatientData): Promise<PatientRecord> {
    return prisma.patient.create({ data });
  }

  async update(id: number, data: UpdatePatientData): Promise<PatientRecord> {
    return prisma.patient.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.patient.delete({ where: { id } });
  }
}
