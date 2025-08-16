import { Repository, EntityRepository } from 'typeorm';
import { User, UserRole } from '@/entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.findOne({ where: { username } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.find({ where: { role, isActive: true } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }

  async findUsersByRoles(roles: UserRole[]): Promise<User[]> {
    return this.createQueryBuilder('user')
      .where('user.role IN (:...roles)', { roles })
      .andWhere('user.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, { lastLoginAt: new Date() });
  }

  async deactivateUser(userId: string): Promise<void> {
    await this.update(userId, { isActive: false });
  }

  async activateUser(userId: string): Promise<void> {
    await this.update(userId, { isActive: true });
  }
} 