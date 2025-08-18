import { Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { UserRole } from "@/commons/constants/roles.constants";

export class UserRepository extends Repository<User> {
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.find({ where: { role, isActive: true } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ where: { isActive: true } });
  }

  async findUsersByRoles(roles: UserRole[]): Promise<User[]> {
    return this.createQueryBuilder("user")
      .where("user.role IN (:...roles)", { roles })
      .andWhere("user.isActive = :isActive", { isActive: true })
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

  async findAll(): Promise<User[]> {
    return this.find();
  }

  async findOneById(id: string): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async updateUser(id: string, updateUserDto: Partial<User>): Promise<User> {
    await this.update(id, updateUserDto);
    return this.findOneById(id);
  }

  async removeUser(id: string): Promise<void> {
    await this.delete(id);
  }
}
