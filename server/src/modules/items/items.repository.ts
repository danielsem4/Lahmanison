import prisma from '../../lib/prisma';
import type { Item } from '@prisma/client';
import type { CreateItemDto, UpdateItemDto } from './items.schema';

export interface IItemsRepository {
  findAllByOwner(ownerId: number): Promise<Item[]>;
  findByIdForOwner(id: number, ownerId: number): Promise<Item | null>;
  create(ownerId: number, data: CreateItemDto): Promise<Item>;
  update(id: number, data: UpdateItemDto): Promise<Item>;
  delete(id: number): Promise<void>;
}

export class ItemsRepository implements IItemsRepository {
  async findAllByOwner(ownerId: number): Promise<Item[]> {
    return prisma.item.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByIdForOwner(id: number, ownerId: number): Promise<Item | null> {
    return prisma.item.findFirst({ where: { id, ownerId } });
  }

  async create(ownerId: number, data: CreateItemDto): Promise<Item> {
    return prisma.item.create({
      data: { title: data.title, description: data.description ?? null, ownerId },
    });
  }

  async update(id: number, data: UpdateItemDto): Promise<Item> {
    return prisma.item.update({ where: { id }, data });
  }

  async delete(id: number): Promise<void> {
    await prisma.item.delete({ where: { id } });
  }
}
