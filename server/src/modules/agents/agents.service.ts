import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';
import { generatePassword } from '../../shared/utils/password';
import { sendNewUserCredentials } from '../../shared/services/email.service';
import type {
  IAgentsRepository,
  AgentRecord,
  UpdateAgentData,
} from './agents.repository';
import type { CreateAgentDto, UpdateAgentDto } from './agents.schema';

const SALT_ROUNDS = 10;

export interface CreateAgentResult {
  agent: AgentRecord;
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

export class AgentsService {
  constructor(private readonly repository: IAgentsRepository) {}

  async getAll(): Promise<AgentRecord[]> {
    return this.repository.findAll();
  }

  async getById(id: number): Promise<AgentRecord> {
    const agent = await this.repository.findById(id);
    if (!agent) {
      throw new AppError('Agent not found', 404);
    }
    return agent;
  }

  async create(dto: CreateAgentDto): Promise<CreateAgentResult> {
    const password = generatePassword();
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const email = dto.email.toLowerCase();

    let agent: AgentRecord;
    try {
      agent = await this.repository.create({
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

    return { agent, password };
  }

  async update(id: number, dto: UpdateAgentDto): Promise<AgentRecord> {
    await this.getById(id); // ensures the target exists and is an agent

    const data: UpdateAgentData = { ...dto };
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
    await this.getById(id); // ensures the target exists and is an agent
    await this.repository.delete(id);
  }
}
