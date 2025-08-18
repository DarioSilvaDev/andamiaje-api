import { Module } from "@nestjs/common";
import { DocumentsService } from "./documents.service";
import { DocumentsController } from "./documents.controller";
import { DocumentRepository } from "@/repositories";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DocumentFile } from "@/entities";
import { AuthorizationService } from "../auth";

@Module({
  imports: [TypeOrmModule.forFeature([DocumentRepository, DocumentFile])],
  controllers: [DocumentsController],
  providers: [DocumentsService, AuthorizationService],
})
export class DocumentsModule {}
