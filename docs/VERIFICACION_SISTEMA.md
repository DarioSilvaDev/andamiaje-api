# ✔️ Checklist de Verificación del Sistema

## 🎯 Objetivo

Verificar que todos los componentes del sistema Andamiaje API están funcionando correctamente después de la implementación de la Fase 1.

---

## ✅ Verificación de Instalación

### 1. Dependencias Instaladas

```bash
npm install
```

**Esperado**: Sin errores, 875+ paquetes instalados

### 2. Compilación Exitosa

```bash
npm run build
```

**Esperado**: `tsc` y `tsc-alias` completan sin errores

### 3. Variables de Entorno Configuradas

**Verificar**: Archivo `.env` existe con:

- ✅ `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`
- ✅ `JWT_SECRET`, `JWT_REFRESH_SECRET`
- ✅ `PORT=5001`

---

## 🗄️ Verificación de Base de Datos

### 1. Base de Datos Creada

```sql
SELECT datname FROM pg_database WHERE datname = 'andamiaje_db';
```

**Esperado**: Retorna `andamiaje_db`

### 2. Conexión Exitosa

```bash
npm run start:dev
```

**Esperado**:

- `🚀 Aplicación ejecutándose en: http://localhost:5001`
- `📚 Documentación disponible en: http://localhost:5001/api/docs`
- Sin errores de conexión a PostgreSQL

### 3. Tablas Creadas (Automáticamente con synchronize)

**Verificar en PostgreSQL**:

```sql
\dt
```

**Esperado**: Tablas creadas:

- `users`
- `forms_v2`
- `acta_forms_v2`
- `admission_forms_v2`
- `plan_forms_v2`
- `semestral_report_forms_v2`
- `monthly_report_forms_v2`
- `accompaniment_followup_forms_v2`
- `family_followup_forms_v2`
- `invoice_forms_v2`
- `form_audit_logs`
- `form_notifications`

---

## 🔐 Verificación de Autenticación

### 1. Registrar Usuario

```http
POST http://localhost:5001/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@andamiaje.com",
  "documentNumber": "12345678",
  "phone": "123456789",
  "password": "test123456",
  "role": "TERAPEUTA"
}
```

**Esperado**:

- Status: `201 Created`
- Respuesta con datos del usuario creado

### 2. Login

```http
POST http://localhost:5001/api/v1/auth/login
Content-Type: application/json

{
  "username": "test@andamiaje.com",
  "password": "test123456"
}
```

**Esperado**:

- Status: `200 OK`
- `accessToken` y `refreshToken` en respuesta
- Información del usuario

### 3. Obtener Perfil

```http
GET http://localhost:5001/api/v1/auth/profile
Authorization: Bearer {accessToken}
```

**Esperado**:

- Status: `200 OK`
- Datos del usuario autenticado

---

## 📝 Verificación de Formularios

### 1. Crear Formulario ACTAS

```http
POST http://localhost:5001/api/v1/forms
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "type": "ACTAS",
  "baseData": {
    "patientName": "Paciente Test",
    "patientDocumentNumber": "11111111",
    "patientAge": 10
  },
  "specificData": {
    "modality": "VIRTUAL",
    "subject": "Reunión test",
    "agenda": "Agenda de prueba",
    "meetingDate": "2025-01-15T10:00:00",
    "durationMinutes": 60,
    "meetingUrl": "https://zoom.us/test",
    "attendees": [{
      "id": "test-1",
      "name": "Test User",
      "role": "TERAPEUTA",
      "attended": true
    }],
    "decisions": "Decisiones de prueba"
  }
}
```

**Esperado**:

- Status: `201 Created`
- Formulario creado con `status: "DRAFT"`
- `id` generado (UUID)

### 2. Verificar Otros Tipos de Formularios

Repetir el mismo test con:

- ✅ `PLAN_TRABAJO`
- ✅ `INFORME_ADMISION`
- ✅ `INFORME_SEMESTRAL`
- ✅ `REPORTE_MENSUAL`
- ✅ `SEGUIMIENTO_ACOMPANANTE`
- ✅ `SEGUIMIENTO_FAMILIA`
- ✅ `FACTURA`

**Esperado**: Todos se crean correctamente

---

## 🔄 Verificación de Workflow

### 1. Enviar Formulario para Revisión

```http
POST http://localhost:5001/api/v1/forms/workflow/{formId}/submit
Authorization: Bearer {accessToken}
```

**Esperado**:

- Status: `200 OK`
- `status` cambia a `"PENDING_REVIEW"`
- `submittedAt` tiene fecha

### 2. Verificar Notificación Creada

```http
GET http://localhost:5001/api/v1/forms/workflow/notifications
Authorization: Bearer {token_director}
```

**Esperado**:

- Notificación de tipo `FORM_SUBMITTED`
- `status: "UNREAD"`

### 3. Aprobar Formulario (Como Director)

```http
PATCH http://localhost:5001/api/v1/forms/workflow/{formId}/approve
Authorization: Bearer {token_director}
```

**Esperado**:

- Status: `200 OK`
- `status` cambia a `"APPROVED"`
- `approvedAt` y `approvedBy` completados
- `pdfGeneratedAt` tiene fecha
- `pdfPath` tiene valor

### 4. Verificar Notificación de Aprobación

```http
GET http://localhost:5001/api/v1/forms/workflow/notifications
Authorization: Bearer {accessToken}
```

**Esperado**:

- Notificación de tipo `FORM_APPROVED`
- Dirigida al creador del formulario

### 5. Rechazar Formulario (Como Director)

```http
PATCH http://localhost:5001/api/v1/forms/workflow/{formId}/reject
Authorization: Bearer {token_director}
Content-Type: application/json

{
  "reason": "Falta información en la sección X"
}
```

**Esperado**:

- Status: `200 OK`
- `status` cambia a `"REJECTED"`
- `rejectedAt` y `rejectedBy` completados
- `rejectionReason` tiene el valor enviado

---

## 🔔 Verificación de Notificaciones

### 1. Obtener Notificaciones

```http
GET http://localhost:5001/api/v1/forms/workflow/notifications?status=UNREAD&limit=10
Authorization: Bearer {accessToken}
```

**Esperado**:

- Lista de notificaciones
- `unreadCount` correcto
- `total` correcto

### 2. Marcar como Leída

```http
PATCH http://localhost:5001/api/v1/forms/workflow/notifications/{notificationId}/read
Authorization: Bearer {accessToken}
```

**Esperado**:

- Status: `200 OK`
- `status` cambia a `"READ"`
- `readAt` tiene fecha

### 3. Estadísticas de Notificaciones

```http
GET http://localhost:5001/api/v1/forms/workflow/notifications/stats
Authorization: Bearer {accessToken}
```

**Esperado**:

- `totalNotifications`
- `unreadCount`
- `readCount`
- `byType` (agrupado por tipo)

---

## 📜 Verificación de Auditoría

### 1. Historial de Formulario

```http
GET http://localhost:5001/api/v1/forms/workflow/{formId}/history
Authorization: Bearer {accessToken}
```

**Esperado**:

- Lista de logs de auditoría
- Acciones: `CREATED`, `SUBMITTED`, `APPROVED`, `PDF_GENERATED`
- Cada log con `user`, `action`, `metadata`

### 2. Versiones de Formulario

```http
GET http://localhost:5001/api/v1/forms/workflow/{formId}/versions
Authorization: Bearer {accessToken}
```

**Esperado**:

- Lista de versiones del formulario
- `version` incremental
- Relación `parentForm` si hay versiones

---

## 🎫 Verificación de Permisos

### 1. Intentar Crear Formulario No Permitido

```http
POST http://localhost:5001/api/v1/forms
Authorization: Bearer {token_acompanante}
Content-Type: application/json

{
  "type": "INFORME_ADMISION",
  ...
}
```

**Esperado**:

- Status: `403 Forbidden`
- Mensaje: "Acceso denegado: el rol no puede crear formularios de tipo..."

### 2. Intentar Aprobar Sin Ser Director

```http
PATCH http://localhost:5001/api/v1/forms/workflow/{formId}/approve
Authorization: Bearer {token_terapeuta}
```

**Esperado**:

- Status: `403 Forbidden`
- Mensaje de permisos insuficientes

### 3. Intentar Editar Formulario Ajeno

```http
PATCH http://localhost:5001/api/v1/forms/workflow/{formId}/edit
Authorization: Bearer {token_otro_usuario}
```

**Esperado**:

- Status: `403 Forbidden`
- Solo el creador o el director pueden editar

---

## 📄 Verificación de Generación de PDF

### 1. Aprobar Formulario

(Ver paso anterior en Verificación de Workflow)

### 2. Verificar Campos de PDF

**Consultar formulario aprobado**:

```http
GET http://localhost:5001/api/v1/forms/workflow/{formId}
```

**Esperado**:

- `pdfGeneratedAt`: Tiene fecha
- `pdfPath`: Tiene ruta (ej: `pdfs/actas/...`)

### 3. Verificar Registro en Auditoría

**Consultar historial**:

```http
GET http://localhost:5001/api/v1/forms/workflow/{formId}/history
```

**Esperado**:

- Log con `action: "PDF_GENERATED"`
- Metadata con `pdfPath`

---

## 🧪 Tests de Validación

### 1. Crear Formulario Sin Campos Obligatorios

**Intentar enviar para revisión formulario incompleto**:

```http
POST http://localhost:5001/api/v1/forms/workflow/{formId}/submit
```

**Esperado**:

- Status: `400 Bad Request`
- Mensaje descriptivo del campo faltante

### 2. Enviar Formulario en Estado Incorrecto

**Intentar enviar formulario ya aprobado**:

```http
POST http://localhost:5001/api/v1/forms/workflow/{formId_aprobado}/submit
```

**Esperado**:

- Status: `400 Bad Request`
- Mensaje: "El formulario no puede ser enviado en su estado actual"

### 3. Rechazar Sin Razón

```http
PATCH http://localhost:5001/api/v1/forms/workflow/{formId}/reject
Authorization: Bearer {token_director}
Content-Type: application/json

{
  "reason": ""
}
```

**Esperado**:

- Status: `400 Bad Request`
- Mensaje: "La razón del rechazo es obligatoria"

---

## 📊 Verificación de Consultas

### 1. Mis Formularios

```http
GET http://localhost:5001/api/v1/forms/workflow/my-forms
Authorization: Bearer {accessToken}
```

**Esperado**:

- Lista de formularios del usuario
- Ordenados por fecha descendente

### 2. Formularios Pendientes (Director)

```http
GET http://localhost:5001/api/v1/forms/workflow/pending
Authorization: Bearer {token_director}
```

**Esperado**:

- Solo formularios con `status: "PENDING_REVIEW"`
- Ordenados por fecha de envío ascendente

### 3. Filtrar por Estado

```http
GET http://localhost:5001/api/v1/forms/workflow/my-forms?status=APPROVED
Authorization: Bearer {accessToken}
```

**Esperado**:

- Solo formularios aprobados del usuario

---

## 🎨 Verificación de Swagger

### 1. Acceder a Swagger UI

**URL**: http://localhost:5001/api/docs

**Esperado**:

- Interfaz de Swagger cargada
- Todos los endpoints documentados
- Categorías organizadas por tags

### 2. Probar Endpoints desde Swagger

- ✅ Autenticar con `/auth/login`
- ✅ Copiar token
- ✅ Hacer clic en "Authorize"
- ✅ Pegar token
- ✅ Probar endpoints protegidos

**Esperado**: Funciona correctamente

---

## ✅ Checklist Completo

### Instalación y Configuración

- [ ] Dependencias instaladas
- [ ] Compilación exitosa
- [ ] Variables de entorno configuradas
- [ ] Base de datos creada
- [ ] Aplicación inicia correctamente

### Autenticación

- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Obtener perfil funciona
- [ ] Refresh token funciona
- [ ] Guards protegen endpoints correctamente

### Formularios (Probar al menos 3 tipos)

- [ ] ACTAS se crea correctamente
- [ ] PLAN_TRABAJO se crea correctamente
- [ ] INFORME_ADMISION se crea correctamente
- [ ] Validaciones funcionan
- [ ] Permisos por rol funcionan

### Workflow

- [ ] Enviar para revisión funciona
- [ ] Aprobar funciona (Director)
- [ ] Rechazar funciona (Director)
- [ ] Editar funciona
- [ ] Estados cambian correctamente

### Notificaciones

- [ ] Se crean automáticamente
- [ ] Se pueden marcar como leídas
- [ ] Estadísticas funcionan
- [ ] Filtros funcionan

### PDF

- [ ] Se genera automáticamente al aprobar
- [ ] `pdfPath` se guarda en formulario
- [ ] Se registra en auditoría
- [ ] No bloquea el workflow si falla

### Auditoría

- [ ] Todas las acciones se registran
- [ ] Historial completo disponible
- [ ] Metadata correcta
- [ ] Usuario registrado en cada acción

### Permisos

- [ ] Roles restringen tipos de formularios
- [ ] Solo director puede aprobar
- [ ] Solo creador puede editar sus borradores
- [ ] Director puede editar cualquier formulario

### Documentación

- [ ] Swagger accesible
- [ ] Todos los endpoints documentados
- [ ] Documentación en `docs/` completa
- [ ] README actualizado

---

## 🚨 Problemas Conocidos

### Si el sistema no inicia:

1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `.env`
3. Verificar que la base de datos exista
4. Revisar logs de error

### Si la compilación falla:

1. Eliminar `node_modules` y `dist`
2. Ejecutar `npm install`
3. Ejecutar `npm run build`

### Si los endpoints no funcionan:

1. Verificar que el token JWT sea válido
2. Verificar que no haya expirado
3. Verificar que el rol tenga permisos
4. Revisar logs del servidor

---

## 🎉 Sistema Verificado

Si todos los checks están completados, el sistema está **100% funcional** y listo para producción.

### Próximos Pasos:

1. Crear usuario Director
2. Crear usuarios de prueba de cada rol
3. Probar flujo completo end-to-end
4. Comenzar a usar en producción

---

**Última actualización**: Enero 2025  
**Versión**: 2.0
