# 📋 Ejemplo Completo: Flujo de Creación de ACTAS con Nueva Arquitectura

## 🎯 **Objetivo**

Mostrar cómo funciona el flujo completo de creación, envío, revisión y aprobación de un formulario ACTAS usando la nueva arquitectura mejorada.

## 🏗️ **Arquitectura Implementada**

### **Entidades Principales:**

- `BaseForm`: Entidad base con workflow completo
- `ActaFormV2`: Entidad específica para ACTAS que extiende BaseForm
- `FormAuditLog`: Registro de todas las acciones
- `FormNotification`: Sistema de notificaciones
- `FormAttachment`: Archivos adjuntos

### **Servicios:**

- `WorkflowService`: Manejo del flujo de estados
- `NotificationService`: Gestión de notificaciones

## 📝 **Flujo Completo de ACTAS**

### **1. Creación del Formulario**

```typescript
// POST /forms/actas
const actaData = {
  type: "ACTAS",
  title: "Acta - Reunión de equipo - 2024-01-15",
  formData: {
    modality: "PRESENCIAL",
    subject: "Revisión de casos del mes de enero",
    agenda:
      "1. Revisión de casos nuevos\n2. Evaluación de tratamientos\n3. Planificación febrero",
    meetingDate: "2024-01-15T14:00:00Z",
    durationMinutes: 120,
    location: "Oficina principal - Sala de juntas",
    attendees: [
      {
        id: "user_123",
        name: "Dr. Juan Pérez",
        role: "Director",
        attended: false,
      },
      {
        id: "user_456",
        name: "María González",
        role: "Terapeuta",
        attended: false,
      },
    ],
    decisions:
      "Se aprobaron 3 nuevos planes de tratamiento y se modificó el horario de consultas",
    agreements:
      "Implementar nuevo protocolo de seguimiento a partir del 1 de febrero",
    nextSteps: "Revisar efectividad del nuevo protocolo en 30 días",
    nextMeetingDate: "2024-02-15",
  },
  patient: {
    name: "Carlos Rodríguez",
    documentNumber: "12345678",
    age: 35,
    diagnosis: "Trastorno de ansiedad generalizada",
  },
};

// El formulario se crea con estado DRAFT
const acta = await formsService.createActaForm(actaData, currentUser);
```

**Resultado:**

- ✅ Formulario creado con `status: DRAFT`
- ✅ `version: 1`
- ✅ `createdBy: currentUser`
- ✅ Log de auditoría: `CREATED`
- ✅ Datos del paciente embebidos
- ✅ Validaciones específicas de ACTAS ejecutadas

### **2. Envío para Revisión**

```typescript
// POST /forms/workflow/{formId}/submit
const submittedActa = await workflowService.submitForReview(
  acta.id,
  currentUser
);
```

**Resultado:**

- ✅ Estado cambia a `PENDING_REVIEW`
- ✅ `submittedAt: new Date()`
- ✅ Log de auditoría: `SUBMITTED`
- ✅ Notificación automática al director
- ✅ Email/SMS al director (si está configurado)

### **3. Revisión por Director**

```typescript
// GET /forms/workflow/pending
const pendingForms = await workflowService.getPendingReviewForms();
// El director ve el formulario ACTAS en su lista de pendientes

// El director puede ver el formulario completo
// GET /forms/{formId}
const actaDetails = await formsService.getFormById(acta.id);
```

**Información visible para el director:**

- 📋 Datos completos del formulario
- 👥 Lista de asistentes
- 📅 Fecha y duración de la reunión
- 📝 Agenda, decisiones y acuerdos
- 🏥 Información del paciente
- 📊 Historial completo de cambios

### **4. Aprobación del Formulario**

```typescript
// PATCH /forms/workflow/{formId}/approve
const approvedActa = await workflowService.approveForm(acta.id, director);
```

**Resultado:**

- ✅ Estado cambia a `APPROVED`
- ✅ `approvedBy: director`
- ✅ `approvedAt: new Date()`
- ✅ Log de auditoría: `APPROVED`
- ✅ Notificación al propietario del formulario
- ✅ **Generación automática de PDF** (implementar después)
- ✅ Archivo PDF almacenado en storage

### **5. Caso Alternativo: Rechazo**

```typescript
// PATCH /forms/workflow/{formId}/reject
const rejectedActa = await workflowService.rejectForm(
  acta.id,
  director,
  "Faltan firmas de los asistentes y la agenda está incompleta"
);
```

**Resultado:**

- ✅ Estado cambia a `REJECTED`
- ✅ `rejectedBy: director`
- ✅ `rejectedAt: new Date()`
- ✅ `rejectionReason: "Faltan firmas..."`
- ✅ Log de auditoría: `REJECTED`
- ✅ Notificación al propietario con razón del rechazo

### **6. Caso Alternativo: Edición por Director**

```typescript
// PATCH /forms/workflow/{formId}/edit
const editedActa = await workflowService.editForm(
  acta.id,
  director,
  {
    formData: {
      ...acta.formData,
      decisions: "Decisión actualizada por el director",
      agreements: "Nuevo acuerdo agregado",
    },
  },
  true // createNewVersion = true
);
```

**Resultado:**

- ✅ Se crea nueva versión (`version: 2`)
- ✅ `parentForm` apunta a la versión original
- ✅ Estado vuelve a `DRAFT`
- ✅ Log de auditoría: `VERSION_CREATED`
- ✅ Notificación al propietario original
- ✅ Versión anterior se mantiene para historial

## 🔍 **Funcionalidades Avanzadas**

### **Trazabilidad Completa**

```typescript
// GET /forms/workflow/{formId}/history
const history = await workflowService.getFormHistory(acta.id);
```

**Resultado:**

```json
[
  {
    "id": "log_1",
    "action": "CREATED",
    "user": { "id": 123, "name": "María González" },
    "createdAt": "2024-01-15T10:00:00Z",
    "description": "Formulario ACTAS creado"
  },
  {
    "id": "log_2",
    "action": "SUBMITTED",
    "user": { "id": 123, "name": "María González" },
    "createdAt": "2024-01-15T11:00:00Z",
    "description": "Enviado para revisión"
  },
  {
    "id": "log_3",
    "action": "APPROVED",
    "user": { "id": 456, "name": "Dr. Juan Pérez" },
    "createdAt": "2024-01-15T16:00:00Z",
    "description": "Aprobado por director"
  }
]
```

### **Sistema de Notificaciones**

```typescript
// GET /forms/workflow/notifications
const notifications = await notificationService.getUserNotifications(user.id);
```

**Notificaciones generadas:**

1. **Para el Director:** "Nuevo formulario ACTAS para revisión"
2. **Para el Propietario:** "Tu formulario ACTAS ha sido aprobado"
3. **Para el Propietario (si rechazado):** "Tu formulario ACTAS ha sido rechazado. Razón: ..."

### **Gestión de Versiones**

```typescript
// GET /forms/workflow/{formId}/versions
const versions = await workflowService.getFormVersions(acta.id);
```

**Resultado:**

```json
[
  {
    "id": "acta_v2",
    "version": 2,
    "status": "APPROVED",
    "createdAt": "2024-01-16T10:00:00Z",
    "lastEditedBy": { "name": "Dr. Juan Pérez" }
  },
  {
    "id": "acta_v1",
    "version": 1,
    "status": "REJECTED",
    "createdAt": "2024-01-15T10:00:00Z",
    "createdBy": { "name": "María González" }
  }
]
```

### **Validaciones Específicas de ACTAS**

```typescript
// La entidad ActaFormV2 tiene validaciones específicas:
await acta.validate(); // Valida:
// ✅ Asunto obligatorio
// ✅ Agenda obligatoria
// ✅ Fecha de reunión obligatoria
// ✅ Fecha no puede ser futura
// ✅ Decisiones obligatorias
// ✅ Al menos un asistente
// ✅ URL obligatoria para reuniones virtuales
```

### **Estadísticas y Reportes**

```typescript
// Métodos específicos de ACTAS:
const attendance = acta.getAttendanceSummary();
// { total: 5, present: 4, absent: 1, attendanceRate: 80 }

const signedAttendees = acta.getSignedAttendees();
// ["Dr. Juan Pérez", "María González", "Carlos López"]

const summary = acta.getSummary();
// Resumen completo del acta formateado
```

## 🚀 **Ventajas de la Nueva Arquitectura**

### **✅ Trazabilidad Completa**

- Sabes exactamente quién hizo qué y cuándo
- Historial completo de cambios
- Versiones del formulario

### **✅ Workflow Robusto**

- Estados claros y transiciones controladas
- Validaciones en cada paso
- Permisos granulares

### **✅ Comunicación Automática**

- Notificaciones automáticas
- Emails/SMS (configurable)
- Dashboard de notificaciones

### **✅ Escalabilidad**

- Fácil agregar nuevos tipos de formulario
- Reutilización de código
- Patrones consistentes

### **✅ Auditoría Completa**

- Logs detallados
- Metadatos de cambios
- Información de contexto

### **✅ Flexibilidad**

- Datos embebidos vs entidades separadas
- Configuración por tipo de formulario
- Extensibilidad futura

## 📊 **Comparación: Antes vs Después**

| Aspecto            | Arquitectura Anterior | Nueva Arquitectura      |
| ------------------ | --------------------- | ----------------------- |
| **Trazabilidad**   | ❌ Limitada           | ✅ Completa             |
| **Workflow**       | ❌ Básico             | ✅ Robusto con estados  |
| **Notificaciones** | ❌ Manual             | ✅ Automáticas          |
| **Versiones**      | ❌ No existe          | ✅ Completo             |
| **Auditoría**      | ❌ No existe          | ✅ Detallada            |
| **Validaciones**   | ❌ Básicas            | ✅ Específicas por tipo |
| **Escalabilidad**  | ❌ Difícil            | ✅ Fácil                |
| **Mantenibilidad** | ❌ Compleja           | ✅ Simple               |

## 🎯 **Próximos Pasos**

1. **Implementar generación de PDF** para formularios aprobados
2. **Configurar notificaciones por email/SMS**
3. **Crear dashboard de estadísticas**
4. **Implementar otros tipos de formulario** (Plan de Trabajo, Informes, etc.)
5. **Agregar búsqueda avanzada** en formularios
6. **Implementar reportes automáticos**

Esta nueva arquitectura te da una base sólida y escalable para manejar cualquier tipo de formulario con trazabilidad completa y workflow robusto.

