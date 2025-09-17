import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Exclude } from "class-transformer";
import * as bcrypt from "bcryptjs";
import { Document } from "./document.entity";
import { AccountStatus, UserRole } from "@/commons/enums";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ name: "first_name", length: 100 })
  firstName: string;

  @Column({ name: "last_name", length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ unique: true, length: 9, name: "document_number" })
  documentNumber: string;

  @Column({ unique: true, length: 20 })
  phone: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.TERAPEUTA,
  })
  role: UserRole;

  @Column({ name: "digital_signature", nullable: true })
  digitalSignature: string;

  @Column({
    type: "enum",
    enum: AccountStatus,
    default: AccountStatus.PENDING_SIGNATURE,
    name: "account_status",
  })
  accountStatus: AccountStatus;

  @Column({ nullable: true })
  specialization?: string;

  @Column({ nullable: true, name: "license_number" })
  licenseNumber?: string;

  @Column({ nullable: true, name: "last_login_at" })
  lastLoginAt?: Date;

  @Column({ nullable: false, name: "first_login", default: true })
  firstLogin?: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relaciones
  @OneToMany(() => Document, (document) => document.createdBy)
  createdDocuments: Document[];

  @OneToMany(() => Document, (document) => document.approvedBy)
  approvedDocuments: Document[];

  // Métodos
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
