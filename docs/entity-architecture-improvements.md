# 🏗️ Propuesta de Mejoras Arquitectónicas para Entidades

## 📋 **Análisis del Problema Actual**

### **Problemas Identificados:**

1. **❌ Violación DRY**: Cada tipo de formulario tiene su propia entidad
2. **❌ Sin Estado de Workflow**: No hay control de estados de aprobación
3. **❌ Relaciones Inconsistentes**: DocumentFile comentado, Document desconectado
4. **❌ Sin Versionado**: No hay historial de cambios
5. **❌ Nomenclatura Inconsistente**: Errores tipográficos y mezcla de idiomas
6. **❌ Falta de Auditoría**: No hay trazabilidad de cambios

## 🎯 **Propuesta de Solución: Arquitectura Modular**

### **1. Entidad Base Abstracta para Formularios**

```typescript
// src/entities/base/base-form.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from "typeorm";
import { User } from "../user.entity";
import { DocumentStatus, FORMTYPE } from "@/commons/enums";

@Entity("forms")
@Index(["type", "status"])
@Index(["createdBy", "createdAt"])
export abstract class BaseForm {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: FORMTYPE })
  type: FORMTYPE;

  @Column({ type: "varchar", length: 200 })
  title: string; // Título descriptivo del formulario

  @Column({ type: "enum", enum: DocumentStatus, default: DocumentStatus.DRAFT })
  status: DocumentStatus;

  @Column({ type: "int", default: 1 })
  version: number;

  @Column({ type: "jsonb", nullable: true })
  metadata: Record<string, any>; // Metadatos específicos del tipo

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ type: "timestamp", nullable: true })
  submittedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  approvedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  rejectedAt?: Date;

  @Column({ type: "text", nullable: true })
  rejectionReason?: string;

  // Relaciones
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by" })
  approvedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "rejected_by" })
  rejectedBy?: User;

  @ManyToOne(() => BaseForm, { nullable: true })
  @JoinColumn({ name: "parent_form_id" })
  parentForm?: BaseForm; // Para versionado

  @OneToMany(() => BaseForm, (form) => form.parentForm)
  versions: BaseForm[];

  @OneToMany(() => FormAttachment, (attachment) => attachment.form)
  attachments: FormAttachment[];

  @OneToMany(() => FormAuditLog, (log) => log.form)
  auditLogs: FormAuditLog[];

  // Timestamps
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Métodos abstractos
  abstract validate(): Promise<boolean>;
  abstract getFormData(): Record<string, any>;
  abstract setFormData(data: Record<string, any>): void;
}
```

### **2. Entidad para Archivos Adjuntos**

```typescript
// src/entities/form-attachment.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { BaseForm } from "./base/base-form.entity";

@Entity("form_attachments")
@Index(["form", "createdAt"])
export class FormAttachment {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255 })
  originalName: string;

  @Column({ type: "varchar", length: 255 })
  filename: string;

  @Column({ type: "varchar", nullable: true })
  fileUrl?: string;

  @Column({ type: "varchar", length: 100 })
  mimeType: string;

  @Column({ type: "bigint" })
  size: number;

  @Column({ type: "varchar", length: 500, nullable: true })
  description?: string;

  @Column({ type: "boolean", default: false })
  isMainFile: boolean;

  @Column({ type: "varchar", length: 50, default: "attachment" })
  category: string; // 'attachment', 'signature', 'evidence', etc.

  @ManyToOne(() => BaseForm, (form) => form.attachments, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "form_id" })
  form: BaseForm;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // Métodos de utilidad
  getFileExtension(): string {
    return this.originalName.split(".").pop()?.toLowerCase() || "";
  }

  isImage(): boolean {
    return this.mimeType.startsWith("image/");
  }

  isPDF(): boolean {
    return this.mimeType === "application/pdf";
  }

  getReadableSize(): string {
    const units = ["B", "KB", "MB", "GB"];
    let size = this.size;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
```

### **3. Entidad de Auditoría**

```typescript
// src/entities/form-audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { BaseForm } from "./base/base-form.entity";
import { User } from "./user.entity";

export enum AuditAction {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  VERSION_CREATED = "VERSION_CREATED",
  ATTACHMENT_ADDED = "ATTACHMENT_ADDED",
  ATTACHMENT_REMOVED = "ATTACHMENT_REMOVED",
}

@Entity("form_audit_logs")
@Index(["form", "action", "createdAt"])
export class FormAuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: AuditAction })
  action: AuditAction;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: true })
  changes?: Record<string, any>; // Cambios realizados

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  userAgent?: string;

  @ManyToOne(() => BaseForm, (form) => form.auditLogs, { onDelete: "CASCADE" })
  @JoinColumn({ name: "form_id" })
  form: BaseForm;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user?: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
```

### **4. Entidades Específicas de Formularios (Patrón Strategy)**

```typescript
// src/entities/specific/plan-form.entity.ts
import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { User } from "../user.entity";

@Entity("plan_forms")
export class PlanForm extends BaseForm {
  @Column({ type: "varchar", length: 100 })
  period: string;

  @Column({ type: "text" })
  fundamentation: string;

  @Column("text", { array: true, name: "general_objectives" })
  generalObjectives: string[];

  @Column("text", { array: true, name: "specific_objectives" })
  specificObjectives: string[]; // ✅ Corregido typo

  @Column({ name: "work_modality" })
  workModality: string;

  @OneToOne(() => User)
  @JoinColumn({ name: "professional_id" })
  professional: User;

  @Column({ type: "jsonb", nullable: true })
  objectivesMetadata: Record<string, any>;

  // Implementación de métodos abstractos
  async validate(): Promise<boolean> {
    return !!(
      this.period &&
      this.fundamentation &&
      this.generalObjectives?.length > 0 &&
      this.specificObjectives?.length > 0 &&
      this.workModality
    );
  }

  getFormData(): Record<string, any> {
    return {
      period: this.period,
      fundamentation: this.fundamentation,
      generalObjectives: this.generalObjectives,
      specificObjectives: this.specificObjectives,
      workModality: this.workModality,
      professionalId: this.professional?.id,
    };
  }

  setFormData(data: Record<string, any>): void {
    this.period = data.period;
    this.fundamentation = data.fundamentation;
    this.generalObjectives = data.generalObjectives || [];
    this.specificObjectives = data.specificObjectives || [];
    this.workModality = data.workModality;
  }
}
```

### **5. Entidad de Paciente/Cliente**

```typescript
// src/entities/patient.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";
import { BaseForm } from "./base/base-form.entity";

@Entity("patients")
@Index(["documentNumber"])
@Index(["firstName", "lastName"])
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  firstName: string;

  @Column({ type: "varchar", length: 100 })
  lastName: string;

  @Column({ type: "varchar", length: 20, unique: true })
  documentNumber: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  email?: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  phone?: string;

  @Column({ type: "date", nullable: true })
  birthDate?: Date;

  @Column({ type: "text", nullable: true })
  diagnosis?: string;

  @Column({ type: "jsonb", nullable: true })
  medicalHistory: Record<string, any>;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => BaseForm, (form) => form.patient)
  forms: BaseForm[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get age(): number | null {
    if (!this.birthDate) return null;
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }
}
```

### **6. Actualización de BaseForm con Relación a Paciente**

```typescript
// Agregar a BaseForm
@ManyToOne(() => Patient, { nullable: true })
@JoinColumn({ name: "patient_id" })
patient?: Patient;

@Column({ type: "uuid", nullable: true })
patientId?: string;
```

## 🔧 **Mejoras en Enums**

```typescript
// src/commons/enums/index.ts

// ✅ Corregir y expandir enums
export enum FORMTYPE {
  PLAN_TRABAJO = "PLAN_TRABAJO",
  INFORME_SEMESTRAL = "INFORME_SEMESTRAL",
  INFORME_ADMISION = "INFORME_ADMISION",
  ACTAS = "ACTAS",
  REPORTE_MENSUAL = "REPORTE_MENSUAL",
  SEGUIMIENTO_ACOMPANANTE = "SEGUIMIENTO_ACOMPANIANTE_EXTERNO",
  SEGUIMIENTO_FAMILIA = "SEGUIMIENTO_FAMILIA",
  FACTURA = "FACTURA",
}

export enum DocumentStatus {
  DRAFT = "DRAFT",
  PENDING_REVIEW = "PENDING_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ARCHIVED = "ARCHIVED",
}

export enum FormPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum AttachmentCategory {
  EVIDENCE = "EVIDENCE",
  SIGNATURE = "SIGNATURE",
  DOCUMENT = "DOCUMENT",
  IMAGE = "IMAGE",
  OTHER = "OTHER",
}
```

## 🎯 **Beneficios de la Nueva Arquitectura**

### **1. Escalabilidad**

- ✅ Fácil agregar nuevos tipos de formularios
- ✅ Patrón Strategy para comportamientos específicos
- ✅ Entidad base común con funcionalidad compartida

### **2. Mantenibilidad**

- ✅ Código DRY (Don't Repeat Yourself)
- ✅ Separación clara de responsabilidades
- ✅ Nomenclatura consistente

### **3. Funcionalidad Avanzada**

- ✅ Versionado completo de formularios
- ✅ Auditoría completa de cambios
- ✅ Sistema de archivos adjuntos robusto
- ✅ Workflow de aprobación con estados

### **4. Performance**

- ✅ Índices optimizados para consultas frecuentes
- ✅ Relaciones lazy/eager según necesidad
- ✅ Almacenamiento JSONB para flexibilidad

### **5. Seguridad y Trazabilidad**

- ✅ Log completo de todas las acciones
- ✅ Información de IP y User-Agent
- ✅ Control de versiones para compliance

## 📋 **Plan de Migración**

### **Fase 1: Preparación**

1. Crear nuevas entidades base
2. Actualizar enums y tipos
3. Crear migraciones de TypeORM

### **Fase 2: Implementación**

1. Migrar datos existentes
2. Actualizar servicios y repositorios
3. Actualizar controladores

### **Fase 3: Testing**

1. Tests unitarios para nuevas entidades
2. Tests de integración para migración
3. Tests de performance

### **Fase 4: Despliegue**

1. Despliegue gradual
2. Monitoreo de performance
3. Rollback plan preparado

## 🚀 **Próximos Pasos Recomendados**

1. **Implementar entidades base** siguiendo el patrón propuesto
2. **Crear migraciones** para datos existentes
3. **Actualizar servicios** para usar nueva arquitectura
4. **Implementar sistema de auditoría** completo
5. **Agregar tests** para todas las nuevas funcionalidades

Esta arquitectura proporciona una base sólida, escalable y mantenible para el sistema de formularios, siguiendo las mejores prácticas de diseño de software y patrones arquitectónicos.

