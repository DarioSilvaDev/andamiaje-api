import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FormEntity } from "./form.entity";
import { User } from "./user.entity";

@Entity("monthly_reports")
export class MonthlyReportForm {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => FormEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "professional_id" })
  professional?: User | null;

  @Column({ length: 50 })
  period: string;

  @Column({ type: "text" })
  activities: string;

  @Column({ type: "text" })
  progress: string;

  @Column({ type: "text" })
  observations: string;
}
