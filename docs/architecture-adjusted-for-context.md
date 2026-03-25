# 🏗️ Arquitectura Ajustada al Contexto Real

## 📋 **AJUSTES CRÍTICOS IDENTIFICADOS**

### **🎯 Contexto Real del Sistema:**

1. **DigitalSignature**: Para firma digital de usuarios profesionales (TERAPEUTA, ACOMPANIANTE_EXTERNO, etc.)
2. **Pacientes**: NO se registran como usuarios, solo se almacenan como datos básicos
3. **AccountStatus**: Controla el estado de la cuenta del usuario
4. **FirstLogin**: Indica si es primer login y necesita cargar firma digital
5. **Usuarios**: Solo profesionales y director(es) se registran

## 🎯 **1. ENTIDADES AJUSTADAS**

### **📊 BaseForm Corregido**

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
import { DocumentStatus, FORMTYPE, UserRole } from "@/commons/enums";

@Entity("forms")
@Index(["type", "status"]) // Para consultas por tipo y estado
@Index(["createdBy", "createdAt"]) // Para consultas por usuario
@Index(["status", "submittedAt"]) // Para formularios pendientes
export class BaseForm {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: FORMTYPE })
  type: FORMTYPE;

  @Column({ type: "varchar", length: 200 })
  title: string; // Ej: "Acta de Sesión - Juan Pérez - 15/01/2024"

  @Column({ type: "enum", enum: DocumentStatus, default: DocumentStatus.DRAFT })
  status: DocumentStatus;

  @Column({ type: "int", default: 1 })
  version: number;

  @Column({ type: "jsonb", nullable: true })
  formData: Record<string, any>; // Datos específicos del formulario

  // Datos del paciente (NO como entidad separada)
  @Column({ type: "varchar", length: 200, nullable: true })
  patientName?: string; // Nombre del paciente

  @Column({ type: "varchar", length: 20, nullable: true })
  patientDocumentNumber?: string; // Documento del paciente

  @Column({ type: "int", nullable: true })
  patientAge?: number; // Edad del paciente

  @Column({ type: "date", nullable: true })
  patientBirthDate?: Date; // Fecha de nacimiento

  @Column({ type: "text", nullable: true })
  patientDiagnosis?: string; // Diagnóstico

  @Column({ type: "text", nullable: true })
  notes?: string; // Notas adicionales del creador

  @Column({ type: "text", nullable: true })
  rejectionReason?: string; // Razón del rechazo

  // Timestamps de workflow
  @Column({ type: "timestamp", nullable: true })
  submittedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  approvedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  rejectedAt?: Date;

  @Column({ type: "timestamp", nullable: true })
  lastEditedAt?: Date;

  // Relaciones principales
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "created_by" })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "approved_by" })
  approvedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "rejected_by" })
  rejectedBy?: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "last_edited_by" })
  lastEditedBy?: User;

  // Relaciones de versionado
  @ManyToOne(() => BaseForm, { nullable: true })
  @JoinColumn({ name: "parent_form_id" })
  parentForm?: BaseForm;

  @OneToMany(() => BaseForm, (form) => form.parentForm)
  versions: BaseForm[];

  // Relaciones de soporte
  @OneToMany(() => FormAttachment, (attachment) => attachment.form)
  attachments: FormAttachment[];

  @OneToMany(() => FormNotification, (notification) => notification.form)
  notifications: FormNotification[];

  @OneToMany(() => FormAuditLog, (log) => log.form)
  auditLogs: FormAuditLog[];

  @OneToMany(() => GeneratedDocument, (doc) => doc.form)
  generatedDocuments: GeneratedDocument[];

  // Timestamps
  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Métodos de negocio
  canBeEditedBy(user: User): boolean {
    if (user.role === UserRole.DIRECTOR) return true;
    if (this.createdBy.id === user.id && this.status === DocumentStatus.DRAFT)
      return true;
    if (
      this.createdBy.id === user.id &&
      this.status === DocumentStatus.REJECTED
    )
      return true;
    return false;
  }

  canBeApprovedBy(user: User): boolean {
    return (
      user.role === UserRole.DIRECTOR &&
      this.status === DocumentStatus.PENDING_REVIEW
    );
  }

  canBeRejectedBy(user: User): boolean {
    return (
      user.role === UserRole.DIRECTOR &&
      this.status === DocumentStatus.PENDING_REVIEW
    );
  }

  submitForReview(): void {
    this.status = DocumentStatus.PENDING_REVIEW;
    this.submittedAt = new Date();
  }

  approve(approvedBy: User): void {
    this.status = DocumentStatus.APPROVED;
    this.approvedBy = approvedBy;
    this.approvedAt = new Date();
  }

  reject(rejectedBy: User, reason: string): void {
    this.status = DocumentStatus.REJECTED;
    this.rejectedBy = rejectedBy;
    this.rejectedAt = new Date();
    this.rejectionReason = reason;
  }

  markAsEdited(editedBy: User): void {
    this.lastEditedBy = editedBy;
    this.lastEditedAt = new Date();
    this.version += 1;
  }

  // Métodos de utilidad
  getDisplayTitle(): string {
    const patientName = this.patientName || "Sin paciente";
    const date = this.createdAt.toLocaleDateString("es-ES");
    return `${this.type} - ${patientName} - ${date}`;
  }

  getStatusDisplay(): string {
    const statusMap = {
      [DocumentStatus.DRAFT]: "Borrador",
      [DocumentStatus.PENDING_REVIEW]: "Pendiente de Revisión",
      [DocumentStatus.APPROVED]: "Aprobado",
      [DocumentStatus.REJECTED]: "Rechazado",
    };
    return statusMap[this.status] || this.status;
  }

  hasAttachments(): boolean {
    return this.attachments && this.attachments.length > 0;
  }

  getMainAttachment(): FormAttachment | null {
    return this.attachments?.find((att) => att.isMainFile) || null;
  }

  // Información del paciente como objeto
  getPatientInfo(): any {
    return {
      name: this.patientName,
      documentNumber: this.patientDocumentNumber,
      age: this.patientAge,
      birthDate: this.patientBirthDate,
      diagnosis: this.patientDiagnosis,
    };
  }

  setPatientInfo(patientData: any): void {
    this.patientName = patientData.name;
    this.patientDocumentNumber = patientData.documentNumber;
    this.patientAge = patientData.age;
    this.patientBirthDate = patientData.birthDate
      ? new Date(patientData.birthDate)
      : undefined;
    this.patientDiagnosis = patientData.diagnosis;
  }
}
```

### **📊 ActaForm Ajustado**

```typescript
// src/entities/specific/acta-form.entity.ts
import { Entity, Column } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { MODALITY_ENUM } from "@/commons/enums";

@Entity("acta_forms")
export class ActaForm extends BaseForm {
  @Column({ type: "enum", enum: MODALITY_ENUM })
  modality: MODALITY_ENUM;

  @Column({ type: "varchar", length: 200 })
  subject: string; // Tema de la reunión

  @Column({ type: "text", nullable: true })
  agenda?: string; // Agenda de la reunión

  @Column({ type: "text" })
  participants: string; // Lista de participantes

  @Column({ type: "text" })
  discussion: string; // Discusión realizada

  @Column({ type: "text", nullable: true })
  agreements?: string; // Acuerdos tomados

  @Column({ type: "text", nullable: true })
  nextSteps?: string; // Próximos pasos

  @Column({ type: "timestamp" })
  sessionDate: Date; // Fecha de la sesión

  @Column({ type: "int", default: 60 })
  durationMinutes: number; // Duración en minutos

  @Column({ type: "jsonb", nullable: true })
  sessionMetadata: Record<string, any>; // Metadatos adicionales

  // Implementación de métodos abstractos de BaseForm
  async validate(): Promise<boolean> {
    return !!(
      this.modality &&
      this.subject &&
      this.participants &&
      this.discussion &&
      this.sessionDate
    );
  }

  getFormData(): Record<string, any> {
    return {
      modality: this.modality,
      subject: this.subject,
      agenda: this.agenda,
      participants: this.participants,
      discussion: this.discussion,
      agreements: this.agreements,
      nextSteps: this.nextSteps,
      sessionDate: this.sessionDate,
      durationMinutes: this.durationMinutes,
      sessionMetadata: this.sessionMetadata,
    };
  }

  setFormData(data: Record<string, any>): void {
    this.modality = data.modality;
    this.subject = data.subject;
    this.agenda = data.agenda;
    this.participants = data.participants;
    this.discussion = data.discussion;
    this.agreements = data.agreements;
    this.nextSteps = data.nextSteps;
    this.sessionDate = new Date(data.sessionDate);
    this.durationMinutes = data.durationMinutes || 60;
    this.sessionMetadata = data.sessionMetadata || {};
  }

  // Métodos específicos de ACTAS
  getParticipantsList(): string[] {
    return this.participants.split("\n").filter((p) => p.trim());
  }

  getDurationDisplay(): string {
    const hours = Math.floor(this.durationMinutes / 60);
    const minutes = this.durationMinutes % 60;

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  isVirtual(): boolean {
    return this.modality === MODALITY_ENUM.VIRTUAL;
  }
}
```

### **📊 FormAttachment Ajustado**

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

export enum AttachmentCategory {
  EVIDENCE = "EVIDENCE", // Evidencia de la sesión
  SIGNATURE = "SIGNATURE", // Firma digital del profesional
  DOCUMENT = "DOCUMENT", // Documento adjunto
  IMAGE = "IMAGE", // Imagen
  OTHER = "OTHER", // Otro tipo
}

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

  @Column({
    type: "enum",
    enum: AttachmentCategory,
    default: AttachmentCategory.DOCUMENT,
  })
  category: AttachmentCategory;

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

  isSignature(): boolean {
    return this.category === AttachmentCategory.SIGNATURE;
  }
}
```

## 🎯 **2. FLUJO AJUSTADO: CREAR FORMULARIO ACTAS**

### **📋 Paso 1: Usuario Solicita Crear ACTAS**

```typescript
// Frontend envía:
POST /forms
{
  "type": "ACTAS",
  "baseData": {
    "patient": {
      "name": "Juan Pérez",
      "documentNumber": "12345678",
      "age": 35,
      "birthDate": "1988-05-10",
      "diagnosis": "Trastorno del lenguaje"
    },
    "notes": "Sesión inicial de evaluación"
  },
  "specificData": {
    "modality": "PRESENCIAL",
    "subject": "Evaluación inicial y plan de trabajo",
    "agenda": "1. Presentación\n2. Evaluación\n3. Plan de trabajo\n4. Próximos pasos",
    "participants": "Dr. Ana López (Terapeuta)\nJuan Pérez (Paciente)\nMaría Pérez (Madre)",
    "discussion": "Se realizó una evaluación inicial completa del paciente...",
    "agreements": "1. Iniciar terapia 2 veces por semana\n2. Enviar informe a médico tratante\n3. Próxima cita en 7 días",
    "nextSteps": "1. Preparar material de trabajo\n2. Coordinar horarios\n3. Enviar recordatorio",
    "sessionDate": "2024-01-15T10:00:00Z",
    "durationMinutes": 90
  }
}
```

### **📋 Paso 2: Validación de Usuario y Firma Digital**

```typescript
// En FormsController.create()
async create(@Body() body: CreateFormDto, @CurrentUser() user: User) {
  // ✅ Validar que el usuario tiene cuenta activa
  if (user.accountStatus !== AccountStatus.ACTIVE) {
    throw new ForbiddenException(
      "Tu cuenta no está activa. Completa el proceso de registro cargando tu firma digital."
    );
  }

  // ✅ Validar que el usuario puede crear ACTAS
  if (!this.permissionsService.canCreateForm(user.role, body.type)) {
    throw new ForbiddenException(
      `El rol "${user.role}" no puede crear formularios ACTAS`
    );
  }

  return this.formsService.create(body.type, body.baseData, body.specificData, user);
}
```

### **📋 Paso 3: Creación en Base de Datos (Ajustada)**

```typescript
// En FormsService.create()
async create(type: FORMTYPE, baseData: any, specificData: any, user: User) {
  // 1. Crear BaseForm
  const baseForm = new BaseForm();
  baseForm.type = type;
  baseForm.title = this.generateTitle(type, baseData, specificData);
  baseForm.status = DocumentStatus.DRAFT;
  baseForm.version = 1;
  baseForm.createdBy = user;
  baseForm.formData = { ...baseData, ...specificData };

  // 2. Establecer datos del paciente (NO crear entidad)
  if (baseData.patient) {
    baseForm.setPatientInfo(baseData.patient);
  }

  // 3. Establecer notas adicionales
  baseForm.notes = baseData.notes;

  // 4. Guardar BaseForm
  const savedBaseForm = await this.formRepository.save(baseForm);

  // 5. Crear entidad específica según el tipo
  switch (type) {
    case FORMTYPE.ACTAS:
      return this.createActaForm(savedBaseForm, specificData);
    // ... otros tipos
  }
}

private generateTitle(type: FORMTYPE, baseData: any, specificData: any): string {
  const patientName = baseData.patient?.name || 'Sin paciente';
  const date = new Date().toLocaleDateString('es-ES');

  switch (type) {
    case FORMTYPE.ACTAS:
      return `Acta - ${specificData.subject} - ${patientName} - ${date}`;
    // ... otros tipos
  }
}
```

### **📋 Paso 4: Estructura en Base de Datos (Ajustada)**

**Tabla `forms` (BaseForm):**

```sql
INSERT INTO forms (
  id, type, title, status, version, form_data,
  patient_name, patient_document_number, patient_age,
  patient_birth_date, patient_diagnosis, notes,
  created_by, created_at
) VALUES (
  'uuid-123',
  'ACTAS',
  'Acta - Evaluación inicial - Juan Pérez - 15/01/2024',
  'DRAFT',
  1,
  '{"modality": "PRESENCIAL", "subject": "Evaluación inicial", ...}',
  'Juan Pérez',
  '12345678',
  35,
  '1988-05-10',
  'Trastorno del lenguaje',
  'Sesión inicial de evaluación',
  'user-id-456',
  NOW()
);
```

**Tabla `acta_forms` (ActaForm):**

```sql
INSERT INTO acta_forms (
  id, modality, subject, agenda, participants, discussion, agreements,
  next_steps, session_date, duration_minutes, session_metadata
) VALUES (
  'uuid-123',
  'PRESENCIAL',
  'Evaluación inicial y plan de trabajo',
  '1. Presentación\n2. Evaluación\n3. Plan de trabajo\n4. Próximos pasos',
  'Dr. Ana López (Terapeuta)\nJuan Pérez (Paciente)\nMaría Pérez (Madre)',
  'Se realizó una evaluación inicial completa del paciente...',
  '1. Iniciar terapia 2 veces por semana\n2. Enviar informe a médico tratante\n3. Próxima cita en 7 días',
  '1. Preparar material de trabajo\n2. Coordinar horarios\n3. Enviar recordatorio',
  '2024-01-15 10:00:00',
  90,
  '{"location": "Consultorio A", "equipment": ["computadora", "materiales"]}'
);
```

## 🎯 **3. MANEJO DE FIRMA DIGITAL**

### **📋 Flujo de Firma Digital**

```typescript
// En AuthService.login()
async login(loginDto: LoginDto): Promise<AuthResponse> {
  const user = await this.validateUser(loginDto.email, loginDto.password);

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // ✅ Verificar si es primer login
  if (user.firstLogin) {
    return {
      user,
      tokens: null, // No generar tokens aún
      requiresSignature: true,
      message: 'Primer login detectado. Debe cargar su firma digital.'
    };
  }

  // ✅ Verificar estado de la cuenta
  if (user.accountStatus === AccountStatus.PENDING_SIGNATURE) {
    return {
      user,
      tokens: null,
      requiresSignature: true,
      message: 'Debe cargar su firma digital para activar la cuenta.'
    };
  }

  // Usuario activo, generar tokens normalmente
  const tokens = await this.generateTokens(user);
  return { user, tokens };
}

// Endpoint para cargar firma digital
async uploadDigitalSignature(userId: number, signatureFile: Express.Multer.File): Promise<void> {
  const user = await this.userRepository.findOne({ where: { id: userId } });

  if (!user) {
    throw new NotFoundException('Usuario no encontrado');
  }

  // Subir archivo de firma
  const signatureUrl = await this.storageService.uploadFile(signatureFile, 'DIGITAL_SIGNATURE', user);

  // Actualizar usuario
  user.digitalSignature = signatureUrl;
  user.accountStatus = AccountStatus.ACTIVE;
  user.firstLogin = false;
  user.lastLoginAt = new Date();

  await this.userRepository.save(user);
}
```

## 🎯 **4. CONSULTAS AJUSTADAS**

### **📊 Consultas por Paciente (Sin Entidad)**

```typescript
// Obtener formularios por nombre de paciente
async getFormsByPatientName(patientName: string): Promise<BaseForm[]> {
  return this.formRepository.find({
    where: { patientName: ILike(`%${patientName}%`) },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' }
  });
}

// Obtener formularios por documento de paciente
async getFormsByPatientDocument(documentNumber: string): Promise<BaseForm[]> {
  return this.formRepository.find({
    where: { patientDocumentNumber: documentNumber },
    relations: ['createdBy'],
    order: { createdAt: 'DESC' }
  });
}

// Estadísticas de pacientes (agrupados por nombre)
async getPatientStatistics(): Promise<any> {
  return this.formRepository
    .createQueryBuilder('form')
    .select('form.patient_name', 'patientName')
    .addSelect('form.patient_document_number', 'documentNumber')
    .addSelect('COUNT(*)', 'totalForms')
    .addSelect('COUNT(CASE WHEN form.status = \'APPROVED\' THEN 1 END)', 'approvedForms')
    .where('form.patient_name IS NOT NULL')
    .groupBy('form.patient_name, form.patient_document_number')
    .orderBy('totalForms', 'DESC')
    .getRawMany();
}
```

## 🎯 **5. BENEFICIOS DE LA ARQUITECTURA AJUSTADA**

### **✅ Simplicidad**

- No hay entidad Patient separada
- Datos del paciente almacenados directamente en BaseForm
- Menos complejidad en relaciones

### **✅ Flexibilidad**

- Fácil agregar nuevos campos de paciente
- No requiere migraciones complejas
- Consultas más directas

### **✅ Performance**

- Menos JOINs en consultas
- Índices más simples
- Consultas más rápidas

### **✅ Contexto Real**

- Manejo correcto de firma digital
- Estados de cuenta apropiados
- Flujo de primer login implementado

## 🚀 **6. PRÓXIMOS PASOS RECOMENDADOS**

1. **Actualizar enums** para incluir estados faltantes
2. **Implementar BaseForm** con datos de paciente embebidos
3. **Crear servicio de firma digital** para manejo de archivos
4. **Actualizar AuthService** para manejar primer login
5. **Implementar consultas** optimizadas para datos de paciente

¿Te parece correcta esta aproximación ajustada al contexto real del sistema?

