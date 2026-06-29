import { AppError } from '../../shared/errors/AppError';
import { TaskStatus } from '@prisma/client';
import type { ITasksRepository, TaskRecord, UpdateTaskData } from './tasks.repository';
import type { CreateTaskDto, UpdateTaskDto } from './tasks.schema';

export class TasksService {
  constructor(private readonly repository: ITasksRepository) {}

  async getAll(): Promise<TaskRecord[]> {
    return this.repository.findAll();
  }

  async getById(id: number): Promise<TaskRecord> {
    const task = await this.repository.findById(id);
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    return task;
  }

  async create(dto: CreateTaskDto, creatorId?: number): Promise<TaskRecord> {
    return this.repository.create({
      title: dto.title,
      description: dto.description ?? null,
      dueDate: dto.dueDate ?? null,
      status: dto.status ?? TaskStatus.OPEN,
      patientId: dto.patientId ?? null,
      createdById: creatorId ?? null,
    });
  }

  async update(id: number, dto: UpdateTaskDto): Promise<TaskRecord> {
    await this.getById(id); // ensures the target exists
    return this.repository.update(id, dto as UpdateTaskData);
  }

  async remove(id: number): Promise<void> {
    await this.getById(id); // ensures the target exists
    await this.repository.delete(id);
  }
}
