import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { FormEntity } from "./form.entity";

@Entity("semestral_reports")
export class SemestralReportForm {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => FormEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @ManyToOne(() => User)
  @JoinColumn({ name: "professional_id" })
  professional: User;

  @Column({ length: 50 })
  period: string;

  @Column({ type: "text" })
  characterization: string;

  @Column({ type: "text", name: "period_evolution" })
  periodEvolution: string;

  @Column({ type: "text" })
  suggestions: string;
}
