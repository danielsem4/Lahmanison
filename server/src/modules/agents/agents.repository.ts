import prisma from '../../lib/prisma';
import { Role } from '@prisma/client';

export interface AgentRecord {
  id: number;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Fields safe to return to the client — never includes hashPassword.
const agentSelect = {
  id: true,
  email: true,
  name: true,
  firstName: true,
  lastName: true,
  phone: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface CreateAgentData {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  hashPassword: string;
}

export interface UpdateAgentData {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface IAgentsRepository {
  findAll(): Promise<AgentRecord[]>;
  findById(id: number): Promise<AgentRecord | null>;
  create(data: CreateAgentData): Promise<AgentRecord>;
  update(id: number, data: UpdateAgentData): Promise<AgentRecord>;
  delete(id: number): Promise<void>;
}

export class AgentsRepository implements IAgentsRepository {
  async findAll(): Promise<AgentRecord[]> {
    return prisma.user.findMany({
      where: { role: Role.AGENT },
      select: agentSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<AgentRecord | null> {
    return prisma.user.findFirst({
      where: { id, role: Role.AGENT },
      select: agentSelect,
    });
  }

  async create(data: CreateAgentData): Promise<AgentRecord> {
    return prisma.user.create({
      data: { ...data, role: Role.AGENT },
      select: agentSelect,
    });
  }

  async update(id: number, data: UpdateAgentData): Promise<AgentRecord> {
    return prisma.user.update({
      where: { id },
      data,
      select: agentSelect,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
