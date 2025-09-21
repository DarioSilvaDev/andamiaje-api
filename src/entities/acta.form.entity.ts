import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { FormEntity } from "./form.entity";
import { MODALITY_ENUM } from "@/commons/enums";

@Entity("actas")
export class ActaForm {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => FormEntity, { onDelete: "CASCADE", eager: true })
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @Column({ name: "modality", type: "enum", enum: MODALITY_ENUM })
  modality: MODALITY_ENUM;

  @Column({ name: "subject", type: "text" })
  subject: string;
}
