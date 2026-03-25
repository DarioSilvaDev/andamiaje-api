import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { UserRepository } from "@/repositories/user.repository";
import { User } from "@/entities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [TypeOrmModule.forFeature([User]), EmailModule],
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
})
export class UsersModule {}
