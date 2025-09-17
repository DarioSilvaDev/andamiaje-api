// import {
//   Entity,
//   PrimaryGeneratedColumn,
//   Column,
//   CreateDateColumn,
//   UpdateDateColumn,
//   ManyToOne,
//   JoinColumn,
// } from "typeorm";
// import { Document } from "./document.entity";

// @Entity("document_files")
// export class DocumentFile {
//   @PrimaryGeneratedColumn("uuid")
//   id: string;

//   @Column({ length: 255 })
//   originalName: string;

//   @Column({ length: 255 })
//   filename: string;

//   @Column({ type: "varchar", nullable: true })
//   fileUrl: string | null;

//   @Column({ length: 100 })
//   mimeType: string;

//   @Column()
//   size: number;

//   @Column({ length: 500 })
//   path: string;

//   @Column({ length: 100, nullable: true })
//   description: string;

//   @Column({ default: false })
//   isMainFile: boolean;

//   // Relaciones
//   @ManyToOne(() => Document, (doc) => doc.attachments, { onDelete: "CASCADE" })
//   @JoinColumn({ name: "document_id" })
//   document: Document;

//   @Column()
//   documentId: string;

//   @CreateDateColumn()
//   createdAt: Date;

//   @UpdateDateColumn()
//   updatedAt: Date;

//   // Métodos
//   getFileExtension(): string {
//     return this.originalName.split(".").pop()?.toLowerCase() || "";
//   }

//   isImage(): boolean {
//     return this.mimeType.startsWith("image/");
//   }

//   isPDF(): boolean {
//     return this.mimeType === "application/pdf";
//   }

//   isDocument(): boolean {
//     return [
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "text/plain",
//     ].includes(this.mimeType);
//   }

//   getReadableSize(): string {
//     const units = ["B", "KB", "MB", "GB"];
//     let size = this.size;
//     let unitIndex = 0;

//     while (size >= 1024 && unitIndex < units.length - 1) {
//       size /= 1024;
//       unitIndex++;
//     }

//     return `${size.toFixed(2)} ${units[unitIndex]}`;
//   }
// }
