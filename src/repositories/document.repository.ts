// import { DataSource, Repository } from "typeorm";
// import { Document, User } from "@/entities";
// import { UserRole } from "@/commons/enums";

// export class DocumentRepository extends Repository<Document> {
//   constructor(private dataSource: DataSource) {
//     super(Document, dataSource.createEntityManager());
//   }

//   async findByStatus(status: string): Promise<Document[]> {
//     return this.find({
//       where: { status },
//       relations: ["createdBy", "approvedBy", "files"],
//       order: { createdAt: "DESC" },
//     });
//   }

//   async findByType(type: DocumentType): Promise<Document[]> {
//     return this.find({
//       where: { type },
//       relations: ["createdBy", "approvedBy", "files"],
//       order: { createdAt: "DESC" },
//     });
//   }

//   async findByCreator(creatorId: User): Promise<Document[]> {
//     return this.find({
//       where: { createdBy: creatorId },
//       relations: ["createdBy", "approvedBy", "files"],
//       order: { createdAt: "DESC" },
//     });
//   }

//   async findPendingApproval(): Promise<Document[]> {
//     return this.find({
//       where: { status: DocumentStatus.PENDING },
//       relations: ["createdBy", "files"],
//       order: { createdAt: "ASC" },
//     });
//   }

//   async findApprovedDocuments(): Promise<Document[]> {
//     return this.find({
//       where: { status: DocumentStatus.APPROVED },
//       relations: ["createdBy", "approvedBy", "files"],
//       order: { approvedAt: "DESC" },
//     });
//   }

//   async findDocumentsByRole(role: UserRole): Promise<Document[]> {
//     const query = this.createQueryBuilder("document")
//       .leftJoinAndSelect("document.createdBy", "creator")
//       .leftJoinAndSelect("document.approvedBy", "approver")
//       .leftJoinAndSelect("document.files", "files");

//     switch (role) {
//       case UserRole.DIRECTOR:
//         return query.getMany();
//       case UserRole.TERAPEUTA:
//       case UserRole.ACOMPANIANTE_EXTERNO:
//       case UserRole.COORDINADOR_UNO:
//       case UserRole.COORDINADOR_DOS:
//         return query
//           .where("creator.role = :role", { role })
//           .orWhere("document.status = :approvedStatus", {
//             approvedStatus: DocumentStatus.APPROVED,
//           })
//           .getMany();
//       default:
//         return [];
//     }
//   }

//   async findDocumentsNeedingPDF(): Promise<Document[]> {
//     return this.find({
//       where: {
//         status: DocumentStatus.APPROVED,
//         pdfGeneratedAt: null,
//       },
//       relations: ["createdBy", "files"],
//     });
//   }

//   async updateDocumentStatus(
//     documentId: string,
//     status: DocumentStatus,
//     approvedById?: string,
//     rejectionReason?: string
//   ): Promise<void> {
//     const updateData: any = { status };

//     if (status === DocumentStatus.APPROVED) {
//       updateData.approvedAt = new Date();
//       updateData.approvedById = approvedById;
//     } else if (status === DocumentStatus.REJECTED) {
//       updateData.rejectedAt = new Date();
//       updateData.rejectionReason = rejectionReason;
//     }

//     await this.update(documentId, updateData);
//   }

//   async markPDFAsGenerated(documentId: string, pdfPath: string): Promise<void> {
//     await this.update(documentId, {
//       pdfGeneratedAt: new Date(),
//       // pdfPath,
//     });
//   }
// }
