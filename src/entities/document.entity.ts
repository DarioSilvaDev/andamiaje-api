import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { UserRole } from "@/commons/constants/roles.constants";
import { User } from "./user.entity";
import { DocumentFile } from "./document-file.entity";

export enum DocumentStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum DocumentScope {
  PACIENTE = "paciente",
  ALUMNO = "alumno",
  FAMILIA = "familia",
}

export enum DocumentType {
  PLAN_TRABAJO = "plan_trabajo",
  INFORME_SEMESTRAL = "informe_semestral",
  ACTAS = "actas",
  REPORTE_MENSUAL = "reporte_mensual",
  SEGUIMIENTO_ACOMPANANTE = "seguimiento_acompaniante_externo",
  SEGUIMIENTO_FAMILIA = "seguimiento_familia",
  FACTURA = "factura",
}

@Entity("documents")
export class Document {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: DocumentType,
  })
  type: DocumentType;

  @Column({
    type: "enum",
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ type: "enum", enum: DocumentScope })
  scope: DocumentScope;

  @Column({ type: "uuid", nullable: true })
  scopeEntityId: string | null; // referencia concreta (ej: alumnoId)

  @Column({ type: "jsonb", nullable: true })
  content: Record<string, any>;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ type: "text", nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  pdfGeneratedAt: Date;

  @Column({ type: "varchar", nullable: true })
  fileUrl: string | null;

  // Usuario creador
  @ManyToOne(() => User, (user) => user.createdDocuments, {
    eager: true,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  // @Column({ type: "uuid" })
  // createdById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by" })
  approvedBy: User | null;

  @Column({ type: "uuid", nullable: true })
  approvedById: string;

  @OneToMany(() => DocumentFile, (file) => file.document, {
    cascade: true,
    eager: true,
  })
  attachments: DocumentFile[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos
  canBeApprovedBy(user: User): boolean {
    return user.role === UserRole.DIRECTOR && this.isPendingApproval();
  }

  canBeRejectedBy(user: User): boolean {
    return user.role === UserRole.DIRECTOR && this.isPendingApproval();
  }

  canBeEditedBy(user: User): boolean {
    return (
      this.createdBy.id === user.id &&
      [DocumentStatus.DRAFT, DocumentStatus.REJECTED].includes(this.status)
    );
  }

  canBeDeletedBy(user: User): boolean {
    return (
      (this.createdBy.id === user.id && this.status === DocumentStatus.DRAFT) ||
      user.role === UserRole.DIRECTOR
    );
  }

  isApproved(): boolean {
    return this.status === DocumentStatus.APPROVED;
  }

  isPendingApproval(): boolean {
    return this.status === DocumentStatus.PENDING;
  }
}
