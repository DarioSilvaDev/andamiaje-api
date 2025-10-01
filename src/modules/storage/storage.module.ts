import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StorageController } from "./storage.controller";
import { UserRepository } from "@/repositories";
import { JwtAuthGuard } from "../auth";

@Module({
  controllers: [StorageController],
  providers: [StorageService, UserRepository, JwtAuthGuard],
})
export class StorageModule {}
