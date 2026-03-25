import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "../user.entity";
import { BaseForm } from "./base-form.entity";
import { NotificationType, NotificationStatus } from "@/commons/enums";

@Entity("form_notifications")
@Index(["recipient", "status", "createdAt"])
@Index(["form", "type"])
export class FormNotification {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => BaseForm, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: BaseForm;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "sender_id" })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "recipient_id" })
  recipient: User;

  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;

  @Column({
    type: "enum",
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @Column({ type: "varchar", length: 200 })
  title: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any>;

  @Column({ type: "timestamp", nullable: true })
  readAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  archivedAt?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Métodos de utilidad
  static createNotification(
    form: BaseForm,
    sender: User,
    recipient: User,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): FormNotification {
    const notification = new FormNotification();
    notification.form = form;
    notification.sender = sender;
    notification.recipient = recipient;
    notification.type = type;
    notification.title = title;
    notification.message = message;
    notification.metadata = metadata;
    return notification;
  }

  markAsRead(): void {
    this.status = NotificationStatus.READ;
    this.readAt = new Date();
  }

  archive(): void {
    this.status = NotificationStatus.ARCHIVED;
    this.archivedAt = new Date();
  }

  isRead(): boolean {
    return this.status === NotificationStatus.READ;
  }

  isUnread(): boolean {
    return this.status === NotificationStatus.UNREAD;
  }

  getTypeDisplay(): string {
    const typeMap = {
      [NotificationType.FORM_SUBMITTED]: "Formulario enviado",
      [NotificationType.FORM_APPROVED]: "Formulario aprobado",
      [NotificationType.FORM_REJECTED]: "Formulario rechazado",
      [NotificationType.FORM_EDITED_BY_DIRECTOR]:
        "Formulario editado por director",
      [NotificationType.FORM_REQUIRES_REVIEW]: "Formulario requiere revisión",
    };
    return typeMap[this.type] || this.type;
  }

  getStatusDisplay(): string {
    const statusMap = {
      [NotificationStatus.UNREAD]: "No leído",
      [NotificationStatus.READ]: "Leído",
      [NotificationStatus.ARCHIVED]: "Archivado",
    };
    return statusMap[this.status] || this.status;
  }

  // Métodos estáticos para crear notificaciones específicas
  static createFormSubmittedNotification(
    form: BaseForm,
    sender: User,
    director: User
  ): FormNotification {
    return FormNotification.createNotification(
      form,
      sender,
      director,
      NotificationType.FORM_SUBMITTED,
      "Nuevo formulario para revisión",
      `El usuario ${sender.fullName} ha enviado el formulario "${form.title}" para revisión.`,
      { formId: form.id, formType: form.type }
    );
  }

  static createFormApprovedNotification(
    form: BaseForm,
    director: User,
    owner: User
  ): FormNotification {
    return FormNotification.createNotification(
      form,
      director,
      owner,
      NotificationType.FORM_APPROVED,
      "Formulario aprobado",
      `El director ${director.fullName} ha aprobado tu formulario "${form.title}".`,
      { formId: form.id, formType: form.type }
    );
  }

  static createFormRejectedNotification(
    form: BaseForm,
    director: User,
    owner: User,
    reason: string
  ): FormNotification {
    return FormNotification.createNotification(
      form,
      director,
      owner,
      NotificationType.FORM_REJECTED,
      "Formulario rechazado",
      `El director ${director.fullName} ha rechazado tu formulario "${form.title}". Razón: ${reason}`,
      { formId: form.id, formType: form.type, reason }
    );
  }

  static createFormEditedNotification(
    form: BaseForm,
    director: User,
    owner: User
  ): FormNotification {
    return FormNotification.createNotification(
      form,
      director,
      owner,
      NotificationType.FORM_EDITED_BY_DIRECTOR,
      "Formulario editado por director",
      `El director ${director.fullName} ha editado tu formulario "${form.title}".`,
      { formId: form.id, formType: form.type }
    );
  }
}
