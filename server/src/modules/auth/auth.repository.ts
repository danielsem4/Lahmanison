import prisma from '../../lib/prisma';

export interface AuthUserRecord {
  id: number;
  email: string;
  name: string | null;
  hashPassword: string;
  role: string;
  isActive: boolean;
}

export interface IAuthRepository {
  findByEmail(email: string): Promise<AuthUserRecord | null>;
  findById(id: number): Promise<AuthUserRecord | null>;
  updatePassword(id: number, hashPassword: string): Promise<void>;
}

export class AuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<AuthUserRecord | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async findById(id: number): Promise<AuthUserRecord | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async updatePassword(id: number, hashPassword: string): Promise<void> {
    await prisma.user.update({ where: { id }, data: { hashPassword } });
  }
}
