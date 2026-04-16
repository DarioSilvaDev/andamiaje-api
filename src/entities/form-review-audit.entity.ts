import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Document } from "./document.entity";
import { FormEntity } from "./form.entity";
import { User } from "./user.entity";

export enum FormReviewAction {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

@Entity("form_review_audits")
export class FormReviewAudit {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => FormEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @ManyToOne(() => Document, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "document_id" })
  document?: Document | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: "reviewed_by" })
  reviewedBy: User;

  @Column({
    type: "enum",
    enum: FormReviewAction,
  })
  action: FormReviewAction;

  @Column({ type: "text", nullable: true })
  reason?: string | null;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
