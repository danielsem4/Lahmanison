import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../lib/env';
import { AppError } from '../../shared/errors/AppError';
import type { IAuthRepository } from './auth.repository';
import type { ChangePasswordDto, LoginDto } from './auth.schema';

const SALT_ROUNDS = 10;

export interface UserShape {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface LoginResult {
  token: string;
  user: UserShape;
}

function toUserShape(user: { id: number; email: string; name: string | null; role: string }): UserShape {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name ?? '',
    role: user.role,
  };
}

export class AuthService {
  constructor(private readonly repository: IAuthRepository) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const user = await this.repository.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValid = await bcrypt.compare(dto.password, user.hashPassword);
    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, env.jwtSecret, {
      expiresIn: '8h',
    });

    return { token, user: toUserShape(user) };
  }

  async getMe(userId: number): Promise<UserShape> {
    const user = await this.repository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('Authentication required', 401);
    }
    return toUserShape(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('Authentication required', 401);
    }

    const isValid = await bcrypt.compare(dto.currentPassword, user.hashPassword);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashPassword = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.repository.updatePassword(userId, hashPassword);
  }
}
