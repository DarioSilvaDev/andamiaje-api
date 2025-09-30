import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { StorageController } from "./storage.controller";
import { UserRepository } from "@/repositories";

@Module({
  // imports: [TypeOrmModule.forFeature([User])],
  controllers: [StorageController],
  providers: [StorageService, UserRepository],
})
export class StorageModule {}
