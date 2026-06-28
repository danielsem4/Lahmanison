import prisma from '../../lib/prisma';
import { Role } from '@prisma/client';

export interface ManagerRecord {
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
const managerSelect = {
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

export interface CreateManagerData {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  hashPassword: string;
}

export interface UpdateManagerData {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface IManagersRepository {
  findAll(): Promise<ManagerRecord[]>;
  findById(id: number): Promise<ManagerRecord | null>;
  create(data: CreateManagerData): Promise<ManagerRecord>;
  update(id: number, data: UpdateManagerData): Promise<ManagerRecord>;
  delete(id: number): Promise<void>;
}

export class ManagersRepository implements IManagersRepository {
  async findAll(): Promise<ManagerRecord[]> {
    return prisma.user.findMany({
      where: { role: Role.MANAGER },
      select: managerSelect,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<ManagerRecord | null> {
    return prisma.user.findFirst({
      where: { id, role: Role.MANAGER },
      select: managerSelect,
    });
  }

  async create(data: CreateManagerData): Promise<ManagerRecord> {
    return prisma.user.create({
      data: { ...data, role: Role.MANAGER },
      select: managerSelect,
    });
  }

  async update(id: number, data: UpdateManagerData): Promise<ManagerRecord> {
    return prisma.user.update({
      where: { id },
      data,
      select: managerSelect,
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
