# 🏗️ Análisis Detallado de BaseForm y Flujo de Formularios

## 📋 **1. ENTIDADES MEJORADAS - ANÁLISIS DETALLADO**

### **🎯 BaseForm: Entidad Central del Sistema**

La entidad `BaseForm` es el núcleo de todo el sistema de formularios. Veamos cada aspecto en detalle:

#### **📊 Estructura de BaseForm**

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
import { Patient } from "../patient.entity";
import { DocumentStatus, FORMTYPE, UserRole } from "@/commons/enums";

@Entity("forms")
@Index(["type", "status"]) // Para consultas por tipo y estado
@Index(["createdBy", "createdAt"]) // Para consultas por usuario
@Index(["status", "submittedAt"]) // Para formularios pendientes
@Index(["patient", "type"]) // Para consultas por paciente
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

  @ManyToOne(() => Patient, { nullable: true, eager: true })
  @JoinColumn({ name: "patient_id" })
  patient?: Patient;

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
    const patientName = this.patient?.fullName || "Sin paciente";
    const date = this.createdAt.toLocaleDateString("es-ES");
    return `${this.type} - ${patientName} - ${date}`;
  }

  getStatusDisplay(): string {
    const statusMap = {
      [DocumentStatus.DRAFT]: "Borrador",
      [DocumentStatus.PENDING_REVIEW]: "Pendiente de Revisión",
      [DocumentStatus.APPROVED]: "Aprobado",
      [DocumentStatus.REJECTED]: "Rechazado",
      [DocumentStatus.ARCHIVED]: "Archivado",
    };
    return statusMap[this.status] || this.status;
  }

  hasAttachments(): boolean {
    return this.attachments && this.attachments.length > 0;
  }

  getMainAttachment(): FormAttachment | null {
    return this.attachments?.find((att) => att.isMainFile) || null;
  }
}
```

#### **🔗 Análisis de Relaciones**

##### **1. Relación con User (ManyToOne)**

```typescript
@ManyToOne(() => User, { eager: true })
@JoinColumn({ name: "created_by" })
createdBy: User;
```

**¿Por qué eager loading?**

- Siempre necesitamos saber quién creó el formulario
- Se usa en listados y detalles
- Evita N+1 queries en consultas frecuentes

**Uso en consultas:**

```typescript
// ✅ Automático - no necesita JOIN
const form = await formRepository.findOne({ where: { id } });
console.log(form.createdBy.fullName); // Disponible inmediatamente

// ❌ Sin eager loading necesitaríamos:
const form = await formRepository.findOne({
  where: { id },
  relations: ["createdBy"],
});
```

##### **2. Relación con Patient (ManyToOne, Opcional)**

```typescript
@ManyToOne(() => Patient, { nullable: true, eager: true })
@JoinColumn({ name: "patient_id" })
patient?: Patient;
```

**¿Por qué opcional?**

- No todos los formularios están asociados a un paciente específico
- Ejemplo: ACTAS pueden ser de reuniones generales
- Permite flexibilidad en el sistema

**Uso práctico:**

```typescript
// Formulario con paciente
const admissionForm = new BaseForm();
admissionForm.patient = patient; // INFORME_ADMISION

// Formulario sin paciente específico
const generalActa = new BaseForm();
generalActa.patient = null; // ACTAS de reunión general
```

##### **3. Relación de Versionado (Self-Referencing)**

```typescript
@ManyToOne(() => BaseForm, { nullable: true })
@JoinColumn({ name: "parent_form_id" })
parentForm?: BaseForm;

@OneToMany(() => BaseForm, (form) => form.parentForm)
versions: BaseForm[];
```

**¿Cómo funciona el versionado?**

```typescript
// Versión original
const originalForm = await formRepository.save(baseForm);

// Crear nueva versión
const newVersion = new BaseForm();
Object.assign(newVersion, originalForm);
newVersion.parentForm = originalForm;
newVersion.version = originalForm.version + 1;
newVersion.id = undefined; // Nueva ID

const savedVersion = await formRepository.save(newVersion);
```

**Consultas de versionado:**

```typescript
// Obtener todas las versiones de un formulario
const allVersions = await formRepository.find({
  where: [{ id: formId }, { parentForm: { id: formId } }],
  order: { version: "DESC" },
});

// Obtener la versión más reciente
const latestVersion = await formRepository.findOne({
  where: { parentForm: { id: formId } },
  order: { version: "DESC" },
});
```

##### **4. Relaciones de Soporte (OneToMany)**

**FormAttachment:**

```typescript
@OneToMany(() => FormAttachment, (attachment) => attachment.form)
attachments: FormAttachment[];
```

**Uso:**

```typescript
// Agregar archivo adjunto
const attachment = new FormAttachment();
attachment.form = baseForm;
attachment.originalName = "firma_paciente.jpg";
attachment.category = "SIGNATURE";
attachment.isMainFile = false;

await attachmentRepository.save(attachment);
```

**FormNotification:**

```typescript
@OneToMany(() => FormNotification, (notification) => notification.form)
notifications: FormNotification[];
```

**Uso:**

```typescript
// Obtener todas las notificaciones de un formulario
const formWithNotifications = await formRepository.findOne({
  where: { id: formId },
  relations: ["notifications", "notifications.recipient"],
});
```

#### **📊 Índices Estratégicos**

```typescript
@Index(["type", "status"]) // Consultas por tipo y estado
@Index(["createdBy", "createdAt"]) // Formularios por usuario
@Index(["status", "submittedAt"]) // Formularios pendientes
@Index(["patient", "type"]) // Formularios por paciente
```

**Consultas optimizadas:**

```typescript
// ✅ Optimizada por índice
const pendingActs = await formRepository.find({
  where: { type: FORMTYPE.ACTAS, status: DocumentStatus.PENDING_REVIEW },
});

// ✅ Optimizada por índice
const userForms = await formRepository.find({
  where: { createdBy: { id: userId } },
  order: { createdAt: "DESC" },
});

// ✅ Optimizada por índice
const patientForms = await formRepository.find({
  where: { patient: { id: patientId } },
});
```

## 🎯 **2. FLUJO COMPLETO: CREAR FORMULARIO ACTAS**

### **📋 Entidad Específica para ACTAS**

```typescript
// src/entities/specific/acta-form.entity.ts
import { Entity, Column, OneToOne, JoinColumn } from "typeorm";
import { BaseForm } from "../base/base-form.entity";
import { User } from "../user.entity";
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

### **🚀 Flujo Completo: Crear Formulario ACTAS**

#### **Paso 1: Usuario Solicita Crear ACTAS**

```typescript
// Frontend envía:
POST /forms
{
  "type": "ACTAS",
  "baseData": {
    "patient": "Juan Pérez",
    "documentNumber": "12345678",
    "age": 35,
    "birthDate": "1988-05-10",
    "diagnosis": "Trastorno del lenguaje",
    "fecha": "2024-01-15"
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

#### **Paso 2: Validación de Permisos**

```typescript
// En FormsController.create()
async create(@Body() body: CreateFormDto, @CurrentUser() user: User) {
  // ✅ Validar que el usuario puede crear ACTAS
  if (!this.permissionsService.canCreateForm(user.role, body.type)) {
    throw new ForbiddenException(
      `El rol "${user.role}" no puede crear formularios ACTAS`
    );
  }

  // Continuar con la creación...
}
```

**Permisos por rol para ACTAS:**

- ✅ DIRECTOR: Puede crear
- ✅ COORDINADOR_UNO: Puede crear
- ✅ COORDINADOR_DOS: Puede crear
- ✅ TERAPEUTA: Puede crear
- ❌ ACOMPANIANTE_EXTERNO: No puede crear

#### **Paso 3: Creación en Base de Datos**

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

  // 2. Buscar o crear paciente si es necesario
  if (baseData.documentNumber) {
    const patient = await this.findOrCreatePatient(baseData);
    baseForm.patient = patient;
  }

  // 3. Guardar BaseForm
  const savedBaseForm = await this.formRepository.save(baseForm);

  // 4. Crear entidad específica según el tipo
  switch (type) {
    case FORMTYPE.ACTAS:
      return this.createActaForm(savedBaseForm, specificData);
    // ... otros tipos
  }
}

private async createActaForm(baseForm: BaseForm, specificData: any): Promise<ActaForm> {
  const actaForm = new ActaForm();

  // Copiar propiedades de BaseForm
  Object.assign(actaForm, baseForm);

  // Establecer datos específicos
  actaForm.setFormData(specificData);

  // Validar datos específicos
  const isValid = await actaForm.validate();
  if (!isValid) {
    throw new BadRequestException('Datos del formulario ACTAS inválidos');
  }

  return this.actaRepository.save(actaForm);
}

private generateTitle(type: FORMTYPE, baseData: any, specificData: any): string {
  const patientName = baseData.patient || 'Sin paciente';
  const date = new Date().toLocaleDateString('es-ES');

  switch (type) {
    case FORMTYPE.ACTAS:
      return `Acta - ${specificData.subject} - ${patientName} - ${date}`;
    // ... otros tipos
  }
}
```

#### **Paso 4: Estructura en Base de Datos**

**Tabla `forms` (BaseForm):**

```sql
INSERT INTO forms (
  id, type, title, status, version, form_data, created_by, patient_id, created_at
) VALUES (
  'uuid-123',
  'ACTAS',
  'Acta - Evaluación inicial - Juan Pérez - 15/01/2024',
  'DRAFT',
  1,
  '{"modality": "PRESENCIAL", "subject": "Evaluación inicial", ...}',
  'user-uuid-456',
  'patient-uuid-789',
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

#### **Paso 5: Envío para Revisión**

```typescript
// Usuario envía formulario para revisión
POST /forms/uuid-123/submit

// En WorkflowService.submitForReview()
async submitForReview(formId: string, user: User): Promise<BaseForm> {
  const form = await this.formRepository.findOne({
    where: { id: formId },
    relations: ["createdBy", "patient"]
  });

  // Validar permisos
  if (!form.canBeEditedBy(user)) {
    throw new ForbiddenException("No tienes permisos para enviar este formulario");
  }

  // Cambiar estado
  form.submitForReview(); // status = PENDING_REVIEW, submittedAt = now()

  // Guardar cambios
  const savedForm = await this.formRepository.save(form);

  // Crear log de auditoría
  await this.createAuditLog(form, AuditAction.SUBMITTED, user, "Acta enviada para revisión");

  // Notificar al director
  await this.notificationService.notifyFormSubmitted(savedForm);

  return savedForm;
}
```

#### **Paso 6: Revisión del Director**

```typescript
// Director aprueba el formulario
PATCH /forms/uuid-123/approve
{}

// En WorkflowService.approveForm()
async approveForm(formId: string, director: User): Promise<BaseForm> {
  const form = await this.formRepository.findOne({
    where: { id: formId },
    relations: ["createdBy", "patient"]
  });

  // Validar que es director
  if (!form.canBeApprovedBy(director)) {
    throw new ForbiddenException("Solo el director puede aprobar formularios");
  }

  // Aprobar formulario
  form.approve(director); // status = APPROVED, approvedBy = director, approvedAt = now()

  // Guardar cambios
  const savedForm = await this.formRepository.save(form);

  // Crear log de auditoría
  await this.createAuditLog(form, AuditAction.APPROVED, director, "Acta aprobada");

  // Notificar al creador
  await this.notificationService.notifyFormApproved(savedForm);

  // Generar PDF automáticamente
  await this.pdfService.generateFormPDF(savedForm);

  return savedForm;
}
```

#### **Paso 7: Generación de PDF**

```typescript
// En PdfService.generateFormPDF()
async generateFormPDF(form: BaseForm): Promise<GeneratedDocument> {
  // 1. Obtener datos completos del formulario
  const actaForm = await this.actaRepository.findOne({
    where: { id: form.id },
    relations: ["patient", "createdBy"]
  });

  // 2. Preparar datos para el template
  const templateData = {
    formInfo: {
      id: form.id,
      type: form.type,
      title: form.title,
      createdAt: form.createdAt,
      approvedAt: form.approvedAt,
      approvedBy: form.approvedBy?.fullName
    },
    patient: actaForm.patient ? {
      name: actaForm.patient.fullName,
      documentNumber: actaForm.patient.documentNumber,
      age: actaForm.patient.age
    } : null,
    session: {
      date: actaForm.sessionDate,
      duration: actaForm.getDurationDisplay(),
      modality: actaForm.modality,
      subject: actaForm.subject,
      agenda: actaForm.agenda,
      participants: actaForm.getParticipantsList(),
      discussion: actaForm.discussion,
      agreements: actaForm.agreements,
      nextSteps: actaForm.nextSteps
    }
  };

  // 3. Generar PDF usando template
  const pdfBuffer = await this.pdfGenerator.generate('acta-template', templateData);

  // 4. Subir PDF a almacenamiento
  const pdfUrl = await this.storageService.uploadBuffer(pdfBuffer, `actas/${form.id}.pdf`);

  // 5. Crear registro de documento generado
  const generatedDoc = new GeneratedDocument();
  generatedDoc.form = form;
  generatedDoc.documentType = 'PDF';
  generatedDoc.fileUrl = pdfUrl;
  generatedDoc.fileSize = pdfBuffer.length;
  generatedDoc.generatedAt = new Date();

  return this.documentRepository.save(generatedDoc);
}
```

#### **Paso 8: Notificación al Creador**

```typescript
// En NotificationService.notifyFormApproved()
async notifyFormApproved(form: BaseForm): Promise<void> {
  await this.createNotification({
    type: NotificationType.FORM_APPROVED,
    title: `Acta aprobada: ${form.title}`,
    message: `Tu acta de sesión ha sido aprobada por el director. El PDF ha sido generado automáticamente.`,
    form,
    recipient: form.createdBy,
    sender: form.approvedBy,
    metadata: {
      formType: form.type,
      formId: form.id,
      approvedAt: form.approvedAt,
      pdfGenerated: true
    }
  });
}
```

## 🎯 **3. CONSULTAS Y CASOS DE USO**

### **📊 Consultas Frecuentes**

#### **1. Obtener Actas Pendientes (Director)**

```typescript
async getPendingActas(): Promise<ActaForm[]> {
  return this.actaRepository.find({
    where: {
      status: DocumentStatus.PENDING_REVIEW,
      type: FORMTYPE.ACTAS
    },
    relations: ['createdBy', 'patient'],
    order: { submittedAt: 'ASC' }
  });
}
```

#### **2. Mis Actas Creadas (Usuario)**

```typescript
async getMyActas(userId: string): Promise<ActaForm[]> {
  return this.actaRepository.find({
    where: {
      createdBy: { id: userId },
      type: FORMTYPE.ACTAS
    },
    relations: ['patient', 'approvedBy'],
    order: { createdAt: 'DESC' }
  });
}
```

#### **3. Actas por Paciente**

```typescript
async getActasByPatient(patientId: string): Promise<ActaForm[]> {
  return this.actaRepository.find({
    where: {
      patient: { id: patientId },
      type: FORMTYPE.ACTAS,
      status: DocumentStatus.APPROVED
    },
    order: { sessionDate: 'DESC' }
  });
}
```

#### **4. Estadísticas de Actas**

```typescript
async getActaStatistics(): Promise<any> {
  return this.actaRepository
    .createQueryBuilder('acta')
    .select('acta.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .addSelect('AVG(acta.duration_minutes)', 'avgDuration')
    .groupBy('acta.status')
    .getRawMany();
}
```

## 🚀 **4. BENEFICIOS DE ESTA ARQUITECTURA**

### **✅ Flexibilidad**

- BaseForm maneja funcionalidad común
- Entidades específicas manejan lógica particular
- Fácil agregar nuevos tipos de formularios

### **✅ Trazabilidad**

- Auditoría completa de cambios
- Versionado automático
- Notificaciones en cada paso

### **✅ Performance**

- Índices optimizados para consultas frecuentes
- Eager loading donde es necesario
- Consultas eficientes con QueryBuilder

### **✅ Mantenibilidad**

- Separación clara de responsabilidades
- Métodos de negocio en las entidades
- Validaciones centralizadas

¿Te gustaría que profundice en algún aspecto específico o procedemos con el plan de implementación?

