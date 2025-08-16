import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User, UserRole } from './user.entity';

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum DocumentType {
  EVALUACION = 'evaluacion',
  INFORME = 'informe',
  PLAN_TERAPEUTICO = 'plan_terapeutico',
  SEGUIMIENTO = 'seguimiento',
  OTRO = 'otro',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
    default: DocumentType.OTRO,
  })
  type: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({ type: 'jsonb', nullable: true })
  content: Record<string, any>;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  pdfGeneratedAt: Date;

  @Column({ nullable: true })
  pdfPath: string;

  // Relaciones
  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  createdBy: any;

  @Column()
  createdById: string;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approvedBy: any;

  @Column({ nullable: true })
  approvedById: string;

  @OneToMany('DocumentFile', 'document')
  files: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Métodos
  canBeApprovedBy(user: any): boolean {
    return user.role === UserRole.DIRECTOR;
  }

  canBeEditedBy(user: any): boolean {
    return (
      this.createdById === user.id ||
      (user.role === UserRole.DIRECTOR && this.status === DocumentStatus.REJECTED)
    );
  }

  isApproved(): boolean {
    return this.status === DocumentStatus.APPROVED;
  }

  isPendingApproval(): boolean {
    return this.status === DocumentStatus.PENDING_APPROVAL;
  }
} 