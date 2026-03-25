# Changelog - Andamiaje API

Todos los cambios notables de este proyecto serán documentados en este archivo.

---

## [2.1.0] - Enero 2025 - SISTEMA DE EMAIL 📧

### ✅ Agregado

#### Sistema de Notificaciones por Email
- ✨ **EmailModule** - Módulo completo de email con `@nestjs-modules/mailer`
- ✨ **EmailService** - Servicio centralizado para envío de emails
- ✨ **6 Templates HTML Responsive**:
  - `form-submitted.hbs` - Formulario enviado para revisión
  - `form-approved.hbs` - Formulario aprobado (con link a PDF)
  - `form-rejected.hbs` - Formulario rechazado (con motivo)
  - `form-edited.hbs` - Formulario editado por director
  - `welcome.hbs` - Bienvenida a nuevo usuario
  - `password-changed.hbs` - Contraseña actualizada

#### Configuración de Email
- ✨ Soporte para **Gmail, Outlook y SMTP personalizado**
- ✨ Variables de entorno configurables (`MAIL_*`)
- ✨ Flag `MAIL_ENABLED` para habilitar/deshabilitar
- ✨ Configuración en `src/config/email.config.ts`
- ✨ Validación con Joi en `src/config/envs.ts`

#### Integración con Workflow
- ✨ Email automático al enviar formulario → Director(es)
- ✨ Email automático al aprobar formulario → Creador (con PDF)
- ✨ Email automático al rechazar formulario → Creador (con razón)
- ✨ Email automático al editar formulario → Creador
- ✨ Email de bienvenida al crear usuario
- ✨ Integrado en `WorkflowService` y `UsersService`

#### Documentación
- ✨ **SISTEMA_EMAIL.md** - Guía completa del sistema de email
- ✨ Configuración paso a paso (Gmail, Outlook, SMTP)
- ✨ Troubleshooting completo
- ✨ Testing con Mailtrap y MailHog
- ✨ Personalización de templates

#### Mejoras Técnicas
- ✨ Logging detallado de todos los envíos
- ✨ Manejo robusto de errores (no interrumpe flujo)
- ✨ Templates con Handlebars
- ✨ Diseño responsive para móviles
- ✨ Emails profesionales con gradientes y branding

### 📝 Actualizado
- 📝 `README.md` - Agregada sección de Sistema de Email
- 📝 `docs/INDEX.md` - Agregado link a SISTEMA_EMAIL.md
- 📝 `env.example` - Agregadas variables de email

---

## [2.0.0] - Enero 2025 - FASE 1 COMPLETADA 🎉

### ✅ Agregado

#### Formularios v2 (8/8)
- ✨ **ActaFormV2** - Actas de reunión con asistentes y firmas
- ✨ **AdmissionFormV2** - Informes de admisión completos
- ✨ **PlanFormV2** - Planes de trabajo terapéutico
- ✨ **SemestralReportFormV2** - Informes semestrales de progreso
- ✨ **MonthlyReportFormV2** - Reportes mensuales
- ✨ **AccompanimentFollowUpFormV2** - Seguimiento de acompañantes
- ✨ **FamilyFollowUpFormV2** - Seguimiento familiar
- ✨ **InvoiceFormV2** - Facturas y comprobantes

#### Sistema de PDF
- ✨ **PdfService** - Servicio centralizado de generación de PDF
- ✨ **BasePdfBuilder** - Clase base para builders
- ✨ **8 PDF Builders** - Un builder específico por cada tipo de formulario
- ✨ Generación automática al aprobar formulario
- ✨ Almacenamiento de ruta del PDF en formulario
- ✨ Registro en auditoría (`PDF_GENERATED`)

#### Factory Pattern
- ✨ **FormFactoryV2** - Factory para crear formularios v2
- ✨ Método `getRequiredFields()` por tipo
- ✨ Método `getFormTypeName()` para nombres descriptivos

#### Servicios Actualizados
- ✨ **FormsService** - Completamente refactorizado para v2
- ✨ Métodos CRUD completos
- ✨ Método `getStats()` para estadísticas

#### Documentación
- ✨ **GUIA_INICIO_RAPIDO.md** - Setup en 5 minutos
- ✨ **FASE_1_COMPLETADA.md** - Resumen de implementación
- ✨ **RESUMEN_FINAL_FASE_1.md** - Resumen ejecutivo
- ✨ **GUIA_CREACION_FORMULARIOS_POR_ROL.md** - Especificación completa

### 🗑️ Eliminado

#### Entidades Legacy (v1)
- ❌ `acta.form.entity.ts`
- ❌ `admissions.entity.ts`
- ❌ `document.entity.ts`
- ❌ `form.entity.ts`
- ❌ `planForm.entity.ts`
- ❌ `semestral_reports.entity.ts`

#### Servicios y Factories Legacy
- ❌ `form.factory.ts` (v1)
- ❌ Referencias a entidades v1 en todos los módulos

#### Enums Obsoletos
- ❌ `AttachmentCategory` (sistema de adjuntos descartado)
- ❌ Acciones de auditoría de adjuntos

### 🔧 Cambiado

#### BaseForm
- ➕ Agregados campos `pdfGeneratedAt` y `pdfPath`
- ➕ Métodos mejorados para validación

#### WorkflowService
- ⚡ Integrada generación de PDF en `approveForm()`
- ⚡ Método privado `generateFormPdf()` agregado
- ⚡ Ejecución en segundo plano

#### User Entity
- 🔄 Eliminadas relaciones con `Document` legacy
- ➕ Agregadas relaciones con `BaseForm` (v2)

#### TypeORM Config
- 🔄 Actualizada lista de entidades (solo v2)
- ❌ Eliminadas referencias a entidades v1

#### AuditAction Enum
- ➕ Agregada acción `PDF_GENERATED`
- ❌ Eliminadas acciones `ATTACHMENT_ADDED` y `ATTACHMENT_REMOVED`

### 🐛 Corregido

- 🐛 Referencias circulares en entidades
- 🐛 Tipos incorrectos en DTOs
- 🐛 Importaciones de entidades eliminadas
- 🐛 Errores de compilación TypeScript

---

## [1.0.0] - Diciembre 2024

### ✅ Agregado (Sistema Base)

#### Autenticación y Autorización
- ✨ Sistema JWT completo con refresh tokens
- ✨ 5 roles (Director, Coordinador 1, Coordinador 2, Terapeuta, Acompañante Externo)
- ✨ Guards: `JwtAuthGuard`, `RolesGuard`, `AuthRolesGuard`, `OwnerGuard`
- ✨ Decoradores: `@Roles()`, `@CurrentUser()`, `@OwnerCheck()`
- ✨ `AuthorizationService` con lógica de permisos

#### Sistema de Usuarios
- ✨ CRUD completo de usuarios
- ✨ Roles múltiples
- ✨ Estados de cuenta
- ✨ Firma digital

#### Sistema de Workflow
- ✨ Estados de formulario (DRAFT, PENDING_REVIEW, APPROVED, REJECTED, ARCHIVED)
- ✨ `WorkflowService` con métodos de workflow
- ✨ Métodos: `submitForReview()`, `approveForm()`, `rejectForm()`, `editForm()`
- ✨ Versionado automático
- ✨ Permisos granulares

#### Sistema de Notificaciones
- ✨ `FormNotification` entity
- ✨ `NotificationService` completo
- ✨ Notificaciones automáticas en eventos del workflow
- ✨ Estados: UNREAD, READ, ARCHIVED
- ✨ Estadísticas de notificaciones

#### Sistema de Auditoría
- ✨ `FormAuditLog` entity
- ✨ Registro automático de todas las acciones
- ✨ Metadata de cambios
- ✨ Historial inmutable

#### Arquitectura Base
- ✨ `BaseForm` entity con STI
- ✨ Datos de paciente embebidos
- ✨ Métodos de negocio integrados
- ✨ Índices optimizados

#### Primer Formulario
- ✨ `ActaFormV2` - Primera implementación funcional

---

## 📊 Estadísticas Totales

### Versión 2.0:
- **Formularios**: 8 tipos implementados
- **Entidades**: 12 tablas en base de datos
- **PDF Builders**: 8 + 1 base
- **Servicios**: 6 servicios principales
- **Endpoints**: 30+ endpoints documentados
- **Líneas de código**: ~5,000+ líneas
- **Documentación**: 10 documentos (35,000+ palabras)

### Calidad:
- **Cobertura de funcionalidades core**: 100%
- **Código legacy**: 0%
- **Compilación**: ✅ Sin errores
- **Arquitectura**: ✅ Consistente
- **Documentación**: ✅ Completa

---

## 🔄 Próximas Versiones Planeadas

### [2.1.0] - Febrero 2025 (Planeado)
- 🔄 Mejoras visuales en PDFs
- 🔄 Sistema de email con templates
- 🔄 Dashboard básico

### [2.2.0] - Marzo 2025 (Planeado)
- 🔄 Tests automatizados
- 🔄 Búsqueda avanzada
- 🔄 Exportación de reportes

### [3.0.0] - Futuro
- 🔄 Sistema de recordatorios
- 🔄 Gestión de pacientes
- 🔄 Analytics avanzados

---

**Mantenido por**: Equipo de Desarrollo Andamiaje  
**Última actualización**: Enero 2025

