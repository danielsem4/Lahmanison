import { AppError } from '../../shared/errors/AppError';
import type {
  IPatientsRepository,
  PatientRecord,
  PatientListRecord,
  UpdatePatientData,
} from './patients.repository';
import type { CreatePatientDto, UpdatePatientDto } from './patients.schema';

export class PatientsService {
  constructor(private readonly repository: IPatientsRepository) {}

  async getAll(): Promise<PatientListRecord[]> {
    return this.repository.findAll();
  }

  async getById(id: number): Promise<PatientRecord> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new AppError('Patient not found', 404);
    }
    return patient;
  }

  async create(dto: CreatePatientDto, creatorId?: number): Promise<PatientRecord> {
    return this.repository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      name: `${dto.firstName} ${dto.lastName}`.trim(),
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      age: dto.age,
      hasImage: dto.hasImage ?? false,
      status: dto.status,
      statusNote: dto.statusNote ?? null,
      createdById: creatorId ?? null,
    });
  }

  async update(id: number, dto: UpdatePatientDto): Promise<PatientRecord> {
    const current = await this.getById(id); // ensures the target exists

    const data: UpdatePatientData = { ...dto };
    if (dto.email) {
      data.email = dto.email.toLowerCase();
    }
    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      const firstName = dto.firstName ?? current.firstName;
      const lastName = dto.lastName ?? current.lastName;
      data.name = `${firstName} ${lastName}`.trim();
    }

    return this.repository.update(id, data);
  }

  async remove(id: number): Promise<void> {
    await this.getById(id); // ensures the target exists
    await this.repository.delete(id);
  }
}
