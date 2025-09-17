import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { FormEntity } from "./form.entity";

@Entity("documents")
export class Document {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "file_url" })
  fileUrl: string; // URL en S3 del PDF generado

  @Column({ default: false })
  approved: boolean;

  @ManyToOne(() => User, (user) => user.createdDocuments)
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.approvedDocuments)
  @JoinColumn({ name: "approved_by" })
  approvedBy: User;

  @ManyToOne(() => FormEntity)
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
