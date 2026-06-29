import prisma from '../../lib/prisma';
import { PatientStatus, AppointmentType, AppointmentStatus } from '@prisma/client';

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
  createdById: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NextAppointment {
  id: number;
  scheduledAt: Date;
  type: AppointmentType;
  status: AppointmentStatus;
}

export interface PatientListRecord extends PatientRecord {
  nextAppointment: NextAppointment | null;
  hasFiles: boolean;
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
  createdById?: number | null;
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
  findAll(): Promise<PatientListRecord[]>;
  findById(id: number): Promise<PatientRecord | null>;
  create(data: CreatePatientData): Promise<PatientRecord>;
  update(id: number, data: UpdatePatientData): Promise<PatientRecord>;
  delete(id: number): Promise<void>;
}

export class PatientsRepository implements IPatientsRepository {
  async findAll(): Promise<PatientListRecord[]> {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        appointments: {
          where: { status: 'SCHEDULED' },
          orderBy: { scheduledAt: 'asc' },
          take: 1,
          select: { id: true, scheduledAt: true, type: true, status: true },
        },
        _count: { select: { files: true } },
      },
    });
    return patients.map(({ appointments, _count, ...patient }) => ({
      ...patient,
      nextAppointment: appointments[0] ?? null,
      hasFiles: _count.files > 0,
    }));
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
