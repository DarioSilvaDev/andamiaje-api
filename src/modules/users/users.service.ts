import { Injectable } from "@nestjs/common";
import { User } from "@/entities/user.entity";
import { UserRepository } from "@/repositories/user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AccountStatus } from "@/commons/enums";

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UserRepository) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.findActiveUsers();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    await this.usersRepository.update(id, updateUserDto);
    return;
  }

  async uploadDigitalSignature(
    user: User,
    digitalSignature: Express.Multer.File
  ): Promise<AccountStatus> {
    const response = await this.usersRepository.update(user.id, {
      digitalSignature: digitalSignature.path,
      accountStatus: AccountStatus.ACTIVE,
    });
    return response.affected ? AccountStatus.ACTIVE : user.accountStatus;
  }

  remove(id: number): Promise<void> {
    return this.usersRepository.deactivateUser(id);
  }
}
