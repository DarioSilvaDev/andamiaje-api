import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../user.entity";
import { BaseForm } from "./base-form.entity";
import { AuditAction } from "@/commons/enums";

@Entity("form_audit_logs")
@Index(["form", "createdAt"])
@Index(["action", "createdAt"])
export class FormAuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => BaseForm, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: BaseForm;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "enum", enum: AuditAction })
  action: AuditAction;

  @Column({ type: "jsonb", nullable: true })
  changes?: Record<string, any>;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  userAgent?: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // Métodos de utilidad
  static createLog(
    form: BaseForm,
    user: User,
    action: AuditAction,
    changes?: Record<string, any>,
    metadata?: Record<string, any>,
    description?: string
  ): FormAuditLog {
    const log = new FormAuditLog();
    log.form = form;
    log.user = user;
    log.action = action;
    log.changes = changes;
    log.metadata = metadata;
    log.description = description;
    return log;
  }

  getActionDisplay(): string {
    const actionMap = {
      [AuditAction.CREATED]: "Creado",
      [AuditAction.UPDATED]: "Actualizado",
      [AuditAction.SUBMITTED]: "Enviado para revisión",
      [AuditAction.APPROVED]: "Aprobado",
      [AuditAction.REJECTED]: "Rechazado",
      [AuditAction.VERSION_CREATED]: "Nueva versión creada",
    };
    return actionMap[this.action] || this.action;
  }

  getFormattedChanges(): string {
    if (!this.changes) return "Sin cambios registrados";

    const changesList = Object.entries(this.changes).map(([key, value]) => {
      if (typeof value === "object") {
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    });

    return changesList.join(", ");
  }
}
