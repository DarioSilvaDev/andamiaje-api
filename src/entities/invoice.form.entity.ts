import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FormEntity } from "./form.entity";

@Entity("invoice_forms")
export class InvoiceForm {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => FormEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: FormEntity;

  @Column({ name: "issuer_name", length: 150 })
  issuerName: string;

  @Column({ name: "tax_id", length: 30 })
  taxId: string;

  @Column({ name: "billing_period", length: 50 })
  billingPeriod: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amount: number;

  @Column({ type: "text", name: "service_description" })
  serviceDescription: string;
}
