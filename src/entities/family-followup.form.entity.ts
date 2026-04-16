import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FormEntity } from "./form.entity";
import { User } from "./user.entity";

@Entity("family_followups")
export class FamilyFollowupForm {
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

  @Column({ type: "text", name: "family_context" })
  familyContext: string;

  @Column({ type: "text", name: "intervention_summary" })
  interventionSummary: string;

  @Column({ type: "text" })
  recommendations: string;
}
