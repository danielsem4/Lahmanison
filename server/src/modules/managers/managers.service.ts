import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { generatePassword } from '../../shared/utils/password';
import { sendNewUserCredentials } from '../../shared/services/email.service';
import type {
  IManagersRepository,
  ManagerRecord,
  UpdateManagerData,
} from './managers.repository';
import type { CreateManagerDto, UpdateManagerDto } from './managers.schema';

const SALT_ROUNDS = 10;

export interface CreateManagerResult {
  manager: ManagerRecord;
  // Dev-only: the generated password is returned so it can be surfaced in the UI
  // while real email delivery is stubbed. Remove once SMTP delivery is in place.
  password: string;
}

function isUniqueEmailError(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === 'P2002'
  );
}

export class ManagersService {
  constructor(private readonly repository: IManagersRepository) {}

  async getAll(): Promise<ManagerRecord[]> {
    return this.repository.findAll();
  }

  async getById(id: number): Promise<ManagerRecord> {
    const manager = await this.repository.findById(id);
    if (!manager) {
      throw new AppError('Manager not found', 404);
    }
    return manager;
  }

  async create(dto: CreateManagerDto): Promise<CreateManagerResult> {
    const password = generatePassword();
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const email = dto.email.toLowerCase();

    let manager: ManagerRecord;
    try {
      manager = await this.repository.create({
        email,
        name: `${dto.firstName} ${dto.lastName}`,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        hashPassword,
      });
    } catch (err) {
      if (isUniqueEmailError(err)) {
        throw new AppError('A user with this email already exists', 409);
      }
      throw err;
    }

    await sendNewUserCredentials(email, password);

    return { manager, password };
  }

  async update(id: number, dto: UpdateManagerDto): Promise<ManagerRecord> {
    await this.getById(id); // ensures the target exists and is a manager

    const data: UpdateManagerData = { ...dto };
    if (dto.email) {
      data.email = dto.email.toLowerCase();
    }
    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      const current = await this.repository.findById(id);
      const firstName = dto.firstName ?? current?.firstName ?? '';
      const lastName = dto.lastName ?? current?.lastName ?? '';
      data.name = `${firstName} ${lastName}`.trim();
    }

    try {
      return await this.repository.update(id, data);
    } catch (err) {
      if (isUniqueEmailError(err)) {
        throw new AppError('A user with this email already exists', 409);
      }
      throw err;
    }
  }

  async remove(id: number): Promise<void> {
    await this.getById(id); // ensures the target exists and is a manager
    await this.repository.delete(id);
  }
}
