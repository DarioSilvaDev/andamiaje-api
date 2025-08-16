import { Request } from 'express';
import { User } from '@/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
  startTime: number;
}

export interface RequestWithUser extends Request {
  user?: User;
  startTime?: number;
} 