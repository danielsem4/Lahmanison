import prisma from '../../lib/prisma';
import { TaskStatus } from '@prisma/client';

export interface TaskRecord {
  id: number;
  title: string;
  description: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  patientId: number | null;
  patient: { id: number; name: string } | null;
  createdById: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  status: TaskStatus;
  patientId?: number | null;
  createdById?: number | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string | null;
  dueDate?: Date | null;
  status?: TaskStatus;
  patientId?: number | null;
}

export interface ITasksRepository {
  findAll(): Promise<TaskRecord[]>;
  findById(id: number): Promise<TaskRecord | null>;
  create(data: CreateTaskData): Promise<TaskRecord>;
  update(id: number, data: UpdateTaskData): Promise<TaskRecord>;
  delete(id: number): Promise<void>;
}

const include = { patient: { select: { id: true, name: true } } };

export class TasksRepository implements ITasksRepository {
  async findAll(): Promise<TaskRecord[]> {
    return prisma.task.findMany({
      include,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: number): Promise<TaskRecord | null> {
    return prisma.task.findUnique({ where: { id }, include });
  }

  async create(data: CreateTaskData): Promise<TaskRecord> {
    return prisma.task.create({ data, include });
  }

  async update(id: number, data: UpdateTaskData): Promise<TaskRecord> {
    return prisma.task.update({ where: { id }, data, include });
  }

  async delete(id: number): Promise<void> {
    await prisma.task.delete({ where: { id } });
  }
}
