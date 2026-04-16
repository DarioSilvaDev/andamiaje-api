import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StorageController } from "./storage.controller";
import { UserRepository } from "@/repositories";
import { JwtAuthGuard } from "../auth";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Document } from "@/entities";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Document]), AuthModule],
  controllers: [StorageController],
  providers: [StorageService, UserRepository, JwtAuthGuard],
  exports: [StorageService],
})
export class StorageModule {}
