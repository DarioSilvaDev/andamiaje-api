import {
  Entity,
  JoinColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./user.entity";
import { FORMTYPE } from "@/commons/enums";

@Entity("forms")
export class FormEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "enum", enum: FORMTYPE })
  type: FORMTYPE; // 'ADMISION', 'PLAN_TRABAJO', 'SEMESTRAL', 'ACTA'

  @Column({ nullable: true })
  patient?: string;

  @Column({ length: 9, name: "document_number" })
  documentNumber: string;

  @Column({ nullable: true, type: "int" })
  age?: number;

  @Column({ nullable: true, type: "date", name: "birth_date" })
  birthdate?: Date;

  @Column({ nullable: true, type: "text" })
  diagnosis?: string;

  @Column({ type: "date" })
  fecha: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: "approved_by" })
  approvedBy?: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
