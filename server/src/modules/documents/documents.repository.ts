import prisma from '../../lib/prisma';

export interface DocumentRecord {
  id: number;
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedById: number | null;
  createdAt: Date;
}

export interface CreateDocumentData {
  fileName: string;
  storageKey: string;
  mimeType: string;
  size: number;
  uploadedById?: number | null;
}

export interface IDocumentsRepository {
  findAll(): Promise<DocumentRecord[]>;
  findById(id: number): Promise<DocumentRecord | null>;
  create(data: CreateDocumentData): Promise<DocumentRecord>;
  delete(id: number): Promise<void>;
}

export class DocumentsRepository implements IDocumentsRepository {
  async findAll(): Promise<DocumentRecord[]> {
    return prisma.document.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findById(id: number): Promise<DocumentRecord | null> {
    return prisma.document.findUnique({ where: { id } });
  }

  async create(data: CreateDocumentData): Promise<DocumentRecord> {
    return prisma.document.create({ data });
  }

  async delete(id: number): Promise<void> {
    await prisma.document.delete({ where: { id } });
  }
}
