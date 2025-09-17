import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { FormEntity } from "./form.entity";

@Entity("admissions")
export class AdmissionForm {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => FormEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @Column({ type: "text" })
  introduction: string;

  @Column({ type: "text" })
  characterization: string;
}
