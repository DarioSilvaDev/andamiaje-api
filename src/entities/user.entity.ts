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

export enum UserRole {
  DIRECTOR = "director",
  TERAPEUTA = "terapeuta",
  ACOMPANIANTE_EXTERNO = "acompañante_externo",
  COORDINADOR = "coordinador",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 100 })
  email: string;

  @Column({ unique: true, length: 20 })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.TERAPEUTA,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @OneToMany("Document", "createdBy")
  createdDocuments: Document[];

  @OneToMany("Document", "approvedBy")
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
