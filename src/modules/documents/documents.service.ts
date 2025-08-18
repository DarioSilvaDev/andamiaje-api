import { Document, DocumentFile, DocumentType } from "@/entities";
import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthorizationService } from "../auth";
import { CreateDocumentDto } from "./dto/create-document.dto";
import { DocumentRepository } from "@/repositories";
import { DocumentScope } from "@/entities/document.entity";

@Injectable()
export class DocumentsService {
  constructor(
    // @InjectRepository(Document)
    private readonly documentRepo: DocumentRepository,
    @InjectRepository(DocumentFile)
    private readonly fileRepo: Repository<DocumentFile>,
    private readonly authorizationService: AuthorizationService
  ) {}

  async create(dto: CreateDocumentDto, user: any) {
    // --- 1. Validar acceso al scope
    const canAccess = this.authorizationService.canAccessScope(user, dto.scope);

    if (!canAccess) {
      throw new ForbiddenException(
        "No tienes permiso para crear documentos en este ámbito"
      );
    }

    // --- 2. Crear documento
    // const doc = this.documentRepo.create({
    //   ...dto,
    //   type: dto.type as unknown as DocumentType,
    // });

    const doc = this.documentRepo.create({
      title: dto.title,
      description: dto.description,
      type: dto.type as unknown as DocumentType, // 👈 casteo del enum
      scope: dto.scope as unknown as DocumentScope, // 👈 idem
      scopeEntityId: dto.scopeEntityId,
      content: dto.content,
      createdBy: { id: user.id }, // 👈 relación ManyToOne
    });

    await this.documentRepo.save(doc);

    // --- 3. Crear adjuntos si los hay
    if (dto.attachments?.length) {
      const files = dto.attachments.map((file) =>
        this.fileRepo.create({
          ...file,
          documentId: doc.id,
        })
      );
      await this.fileRepo.save(files);
      doc.attachments = files;
    }

    return doc;
  }
}
