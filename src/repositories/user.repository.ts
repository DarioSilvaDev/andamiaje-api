import { DataSource, Repository } from "typeorm";
import { User } from "@/entities/user.entity";
import { AccountStatus, UserRole } from "@/commons/enums";
import { Injectable } from "@nestjs/common";
@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findOneWithOptionalPassword(
    fields: Partial<User>,
    includePassword = false
  ): Promise<User | null> {
    const query = this.createQueryBuilder("user");

    Object.entries(fields).forEach(([key, value]) => {
      query.andWhere(`user.${key} = :${key}`, { [key]: value });
    });

    if (includePassword) {
      query.addSelect("user.password");
    }

    return query.getOne();
  }

  async findByDocumentNumber(documentNumber: string): Promise<User | null> {
    return this.findOne({ where: { documentNumber } });
  }

  async findByRole(role: UserRole): Promise<User[]> {
    return this.find({ where: { role, accountStatus: AccountStatus.ACTIVE } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.find({ where: { accountStatus: AccountStatus.ACTIVE } });
  }

  async findUsersByRoles(roles: UserRole[]): Promise<User[]> {
    return this.createQueryBuilder("user")
      .where("user.role IN (:...roles)", { roles })
      .andWhere("user.accountStatus = :accountStatus", {
        accountStatus: AccountStatus.ACTIVE,
      })
      .getMany();
  }

  async updateLastLogin(userId: number): Promise<void> {
    await this.update(userId, { lastLoginAt: new Date() });
  }

  async deactivateUser(userId: number): Promise<void> {
    await this.update(userId, { accountStatus: AccountStatus.DISABLED });
  }

  async activateUser(userId: number): Promise<void> {
    await this.update(userId, {
      accountStatus: AccountStatus.ACTIVE,
      firstLogin: false,
    });
  }

  async findAll(): Promise<User[]> {
    return this.find();
  }

  async findOneById(id: number): Promise<User | null> {
    return this.findOne({ where: { id } });
  }

  async updateUser(id: number, updateUserDto: Partial<User>): Promise<User> {
    await this.update(id, updateUserDto);
    return this.findOneWithOptionalPassword({ id }, false);
  }

  async removeUser(id: number): Promise<void> {
    await this.delete(id);
  }
}
