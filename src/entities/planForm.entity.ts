import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { FormEntity } from "./form.entity";

@Entity("plan_forms")
export class PlanForm {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => FormEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @ManyToOne(() => User)
  @JoinColumn({ name: "professional_id" })
  professional: User;

  @Column()
  period: string;

  @Column({ type: "text" })
  fundamentation: string;

  @Column("text", { array: true, name: "general_objectives" })
  generalObjectives: string[];

  @Column("text", { array: true, name: "specificoobjectives" })
  specificObjectives: string[];

  @Column({ name: "work_modality" })
  workModality: string; // modalidad_abordaje
}
