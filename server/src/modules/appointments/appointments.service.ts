import { AppError } from '../../shared/errors/AppError';
import { AppointmentStatus, AppointmentType } from '@prisma/client';
import type {
  IAppointmentsRepository,
  AppointmentRecord,
  UpdateAppointmentData,
} from './appointments.repository';
import type { CreateAppointmentDto, UpdateAppointmentDto } from './appointments.schema';

export class AppointmentsService {
  constructor(private readonly repository: IAppointmentsRepository) {}

  async getAll(patientId?: number): Promise<AppointmentRecord[]> {
    return this.repository.findAll(patientId);
  }

  async getById(id: number): Promise<AppointmentRecord> {
    const appointment = await this.repository.findById(id);
    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }
    return appointment;
  }

  async create(dto: CreateAppointmentDto, creatorId?: number): Promise<AppointmentRecord> {
    return this.repository.create({
      patientId: dto.patientId,
      scheduledAt: dto.scheduledAt,
      type: dto.type ?? AppointmentType.MEETING,
      status: dto.status ?? AppointmentStatus.SCHEDULED,
      note: dto.note ?? null,
      createdById: creatorId ?? null,
    });
  }

  async update(id: number, dto: UpdateAppointmentDto): Promise<AppointmentRecord> {
    await this.getById(id); // ensures the target exists
    return this.repository.update(id, dto as UpdateAppointmentData);
  }

  async remove(id: number): Promise<void> {
    await this.getById(id); // ensures the target exists
    await this.repository.delete(id);
  }
}
