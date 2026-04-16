import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FormEntity } from "./form.entity";
import { User } from "./user.entity";

@Entity("companion_followups")
export class CompanionFollowupForm {
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

  @Column({ type: "text", name: "accompaniment_detail" })
  accompanimentDetail: string;

  @Column({ type: "text", name: "student_evolution" })
  studentEvolution: string;

  @Column({ type: "text" })
  recommendations: string;
}
