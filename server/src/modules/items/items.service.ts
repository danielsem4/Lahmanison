import { AppError } from '../../shared/errors/AppError';
import type { IItemsRepository } from './items.repository';
import type { CreateItemDto, UpdateItemDto } from './items.schema';

export class ItemsService {
  constructor(private readonly repository: IItemsRepository) {}

  async getAll(ownerId: number) {
    return this.repository.findAllByOwner(ownerId);
  }

  async getById(id: number, ownerId: number) {
    const item = await this.repository.findByIdForOwner(id, ownerId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }
    return item;
  }

  async create(ownerId: number, dto: CreateItemDto) {
    return this.repository.create(ownerId, dto);
  }

  async update(id: number, ownerId: number, dto: UpdateItemDto) {
    await this.getById(id, ownerId); // ensures ownership
    return this.repository.update(id, dto);
  }

  async remove(id: number, ownerId: number) {
    await this.getById(id, ownerId); // ensures ownership
    await this.repository.delete(id);
  }
}
