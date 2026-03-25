import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { User } from "../user.entity";
import { DocumentStatus, FORMTYPE, UserRole } from "@/commons/enums";

@Entity("forms_v2")
@Index(["type", "status"])
@Index(["createdBy", "createdAt"])
@Index(["status", "submittedAt"])
export class BaseForm {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: FORMTYPE })
  type: FORMTYPE;

  @Column({ type: "varchar", length: 200 })
  title: string;

  @Column({ type: "enum", enum: DocumentStatus, default: DocumentStatus.DRAFT })
  status: DocumentStatus;

  @Column({ type: "int", default: 1 })
  version: number;

  @Column({ type: "jsonb", nullable: true })
  formData: Record<string, any>;

  // Datos del paciente embebidos (NO como entidad separada)
  @Column({ type: "varchar", length: 200, nullable: true })
  patientName?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  patientDocumentNumber?: string;

  @Column({ type: "int", nullable: true })
  patientAge?: number;

  @Column({ type: "date", nullable: true })
  patientBirthDate?: Date;

  @Column({ type: "text", nullable: true })
  patientDiagnosis?: string;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ type: "text", nullable: true })
  rejectionReason?: string;

  // Timestamps de workflow
  @Column({ type: "timestamp", nullable: true })
  submittedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  approvedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  rejectedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  lastEditedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  pdfGeneratedAt?: Date;

  @Column({ type: "varchar", length: 500, nullable: true })
  pdfPath?: string;

  // Relaciones principales
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by" })
  approvedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "rejected_by" })
  rejectedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "last_edited_by" })
  lastEditedBy?: User;

  // Relaciones de versionado
  @ManyToOne(() => BaseForm, { nullable: true })
  @JoinColumn({ name: "parent_form_id" })
  parentForm?: BaseForm;

  @OneToMany(() => BaseForm, (form) => form.parentForm)
  versions: BaseForm[];

  // Relaciones de soporte (se implementarán después)
  // @OneToMany(() => FormAttachment, (attachment) => attachment.form)
  // attachments: FormAttachment[];

  // @OneToMany(() => FormNotification, (notification) => notification.form)
  // notifications: FormNotification[];

  // @OneToMany(() => FormAuditLog, (log) => log.form)
  // auditLogs: FormAuditLog[];

  // Timestamps
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Métodos de negocio
  canBeEditedBy(user: User): boolean {
    if (user.role === UserRole.DIRECTOR) return true;
    if (this.createdBy.id === user.id && this.status === DocumentStatus.DRAFT)
      return true;
    if (
      this.createdBy.id === user.id &&
      this.status === DocumentStatus.REJECTED
    )
      return true;
    return false;
  }

  canBeApprovedBy(user: User): boolean {
    return (
      user.role === UserRole.DIRECTOR &&
      this.status === DocumentStatus.PENDING_REVIEW
    );
  }

  canBeRejectedBy(user: User): boolean {
    return (
      user.role === UserRole.DIRECTOR &&
      this.status === DocumentStatus.PENDING_REVIEW
    );
  }

  submitForReview(): void {
    this.status = DocumentStatus.PENDING_REVIEW;
    this.submittedAt = new Date();
  }

  approve(approvedBy: User): void {
    this.status = DocumentStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  reject(rejectedBy: User, reason: string): void {
    this.status = DocumentStatus.REJECTED;
    this.rejectedBy = rejectedBy;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
  }

  markAsEdited(editedBy: User): void {
    this.lastEditedBy = editedBy;
    this.lastEditedAt = new Date();
    this.version += 1;
  }

  // Métodos de utilidad
  getDisplayTitle(): string {
    const patientName = this.patientName || "Sin paciente";
    const date = this.createdAt.toLocaleDateString("es-ES");
    return `${this.type} - ${patientName} - ${date}`;
  }

  getStatusDisplay(): string {
    const statusMap = {
      [DocumentStatus.DRAFT]: "Borrador",
      [DocumentStatus.PENDING_REVIEW]: "Pendiente de Revisión",
      [DocumentStatus.APPROVED]: "Aprobado",
      [DocumentStatus.REJECTED]: "Rechazado",
      [DocumentStatus.ARCHIVED]: "Archivado",
    };
    return statusMap[this.status] || this.status;
  }

  // Información del paciente como objeto
  getPatientInfo(): any {
    return {
      name: this.patientName,
      documentNumber: this.patientDocumentNumber,
      age: this.patientAge,
      birthDate: this.patientBirthDate,
      diagnosis: this.patientDiagnosis,
    };
  }

  setPatientInfo(patientData: any): void {
    this.patientName = patientData.name;
    this.patientDocumentNumber = patientData.documentNumber;
    this.patientAge = patientData.age;
    this.patientBirthDate = patientData.birthDate
      ? new Date(patientData.birthDate)
      : undefined;
    this.patientDiagnosis = patientData.diagnosis;
  }

  // Métodos abstractos para implementar en entidades específicas
  async validate(): Promise<boolean> {
    throw new Error("validate() debe ser implementado en la clase hija");
  }

  getFormData(): Record<string, any> {
    throw new Error("getFormData() debe ser implementado en la clase hija");
  }

  setFormData(data: Record<string, any>): void {
    throw new Error("setFormData() debe ser implementado en la clase hija");
  }
}
