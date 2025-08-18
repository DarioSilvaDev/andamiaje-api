import { Injectable } from "@nestjs/common";
import { User } from "@/entities/user.entity";
import { UserRepository } from "@/repositories/user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

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

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    await this.usersRepository.update(id, updateUserDto);
    return;
  }

  remove(id: string): Promise<void> {
    return this.usersRepository.deactivateUser(id);
  }
}
