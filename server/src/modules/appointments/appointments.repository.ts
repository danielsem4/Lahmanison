import prisma from '../../lib/prisma';
import { AppointmentStatus, AppointmentType } from '@prisma/client';

export interface AppointmentRecord {
  id: number;
  patientId: number;
  patient: { id: number; name: string } | null;
  scheduledAt: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  note: string | null;
  createdById: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAppointmentData {
  patientId: number;
  scheduledAt: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  note?: string | null;
  createdById?: number | null;
}

export interface UpdateAppointmentData {
  patientId?: number;
  scheduledAt?: Date;
  type?: AppointmentType;
  status?: AppointmentStatus;
  note?: string | null;
}

export interface IAppointmentsRepository {
  findAll(patientId?: number): Promise<AppointmentRecord[]>;
  findById(id: number): Promise<AppointmentRecord | null>;
  create(data: CreateAppointmentData): Promise<AppointmentRecord>;
  update(id: number, data: UpdateAppointmentData): Promise<AppointmentRecord>;
  delete(id: number): Promise<void>;
}

const include = { patient: { select: { id: true, name: true } } };

export class AppointmentsRepository implements IAppointmentsRepository {
  async findAll(patientId?: number): Promise<AppointmentRecord[]> {
    return prisma.appointment.findMany({
      where: patientId ? { patientId } : {},
      include,
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findById(id: number): Promise<AppointmentRecord | null> {
    return prisma.appointment.findUnique({ where: { id }, include });
  }

  async create(data: CreateAppointmentData): Promise<AppointmentRecord> {
    return prisma.appointment.create({ data, include });
  }

  async update(id: number, data: UpdateAppointmentData): Promise<AppointmentRecord> {
    return prisma.appointment.update({ where: { id }, data, include });
  }

  async delete(id: number): Promise<void> {
    await prisma.appointment.delete({ where: { id } });
  }
}
