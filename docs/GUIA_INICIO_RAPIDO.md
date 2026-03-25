# 🚀 Guía de Inicio Rápido - Andamiaje API

## ⚡ Inicio en 5 Minutos

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo `env.example` a `.env` y configura:

```env
# Base de datos (REQUERIDO)
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=andamiaje_db

# JWT (REQUERIDO)
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
```

### 3. Crear Base de Datos

```sql
CREATE DATABASE andamiaje_db;
```

### 4. Iniciar la Aplicación

```bash
npm run start:dev
```

### 5. Acceder a la Documentación

- **API**: http://localhost:5001/api/v1
- **Swagger**: http://localhost:5001/api/docs

---

## 🎯 Primeros Pasos

### Crear un Usuario (Vía Swagger o Postman)

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@ejemplo.com",
  "documentNumber": "12345678",
  "phone": "123456789",
  "password": "password123",
  "role": "TERAPEUTA"
}
```

### Iniciar Sesión

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "juan@ejemplo.com",
  "password": "password123"
}
```

**Respuesta**:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... },
  "expiresIn": 86400
}
```

Copia el `accessToken` para usarlo en las siguientes peticiones.

---

## 📝 Crear Tu Primer Formulario

### Ejemplo: Crear un Acta de Reunión

```http
POST /api/v1/forms
Authorization: Bearer {tu_accessToken}
Content-Type: application/json

{
  "type": "ACTAS",
  "baseData": {
    "patientName": "María González",
    "patientDocumentNumber": "98765432",
    "patientAge": 8,
    "patientBirthDate": "2016-03-15",
    "patientDiagnosis": "Trastorno del lenguaje"
  },
  "specificData": {
    "modality": "VIRTUAL",
    "subject": "Reunión de seguimiento trimestral",
    "agenda": "1. Revisión de objetivos\n2. Evaluación de progreso",
    "meetingDate": "2025-01-15T10:00:00",
    "durationMinutes": 60,
    "meetingUrl": "https://zoom.us/j/123456789",
    "attendees": [
      {
        "id": "user-123",
        "name": "Juan Pérez",
        "role": "TERAPEUTA",
        "attended": true
      }
    ],
    "decisions": "Continuar con el plan actual",
    "agreements": "Reunión mensual de seguimiento",
    "nextSteps": "Elaborar plan de ejercicios"
  }
}
```

**Respuesta**:
```json
{
  "id": "uuid-del-formulario",
  "type": "ACTAS",
  "title": "Acta - Reunión de seguimiento trimestral - 15/01/2025",
  "status": "DRAFT",
  "version": 1,
  "createdBy": { ... },
  "createdAt": "2025-01-15T10:00:00.000Z",
  ...
}
```

---

## 🔄 Workflow Completo

### 1. Editar el Formulario (Opcional)

```http
PATCH /api/v1/forms/workflow/{formId}/edit
Authorization: Bearer {tu_accessToken}
Content-Type: application/json

{
  "updates": {
    "decisions": "Decisiones actualizadas..."
  },
  "createNewVersion": false
}
```

### 2. Enviar para Revisión

```http
POST /api/v1/forms/workflow/{formId}/submit
Authorization: Bearer {tu_accessToken}
```

**Resultado**:
- Estado cambia a `PENDING_REVIEW`
- Se crea notificación para el Director
- El formulario ya no es editable (excepto por el Director)

### 3. El Director Aprueba (o Rechaza)

#### Aprobar:
```http
PATCH /api/v1/forms/workflow/{formId}/approve
Authorization: Bearer {token_del_director}
```

**Resultado**:
- Estado cambia a `APPROVED`
- Se genera PDF automáticamente
- Se crea notificación para el creador
- Se registra en auditoría

#### Rechazar:
```http
PATCH /api/v1/forms/workflow/{formId}/reject
Authorization: Bearer {token_del_director}
Content-Type: application/json

{
  "reason": "Falta información en la sección de decisiones. Por favor agregar detalles sobre los próximos pasos."
}
```

**Resultado**:
- Estado cambia a `REJECTED`
- Se crea notificación con la razón
- El creador puede editar y volver a enviar

### 4. Ver Mis Formularios

```http
GET /api/v1/forms/workflow/my-forms?status=DRAFT
Authorization: Bearer {tu_accessToken}
```

### 5. Ver Notificaciones

```http
GET /api/v1/forms/workflow/notifications?status=UNREAD&limit=20
Authorization: Bearer {tu_accessToken}
```

### 6. Ver Historial de Cambios

```http
GET /api/v1/forms/workflow/{formId}/history
Authorization: Bearer {tu_accessToken}
```

---

## 👥 Permisos por Rol

### ¿Qué Formularios Puedo Crear?

Consulta la tabla en: `docs/GUIA_CREACION_FORMULARIOS_POR_ROL.md#matriz-de-permisos-por-rol`

**Resumen rápido**:

- **Director**: ✅ Todos
- **Coordinador 1**: ✅ 7 tipos (excepto SEGUIMIENTO_FAMILIA)
- **Coordinador 2**: ✅ 4 tipos (SEGUIMIENTO_FAMILIA, ACTAS, FACTURA, INFORME_SEMESTRAL)
- **Terapeuta**: ✅ 5 tipos (PLAN_TRABAJO, INFORME_SEMESTRAL, ACTAS, FACTURA, INFORME_ADMISION)
- **Acompañante Externo**: ✅ 3 tipos (REPORTE_MENSUAL, PLAN_TRABAJO, FACTURA)

---

## 📋 Ejemplos de Todos los Formularios

### Plan de Trabajo

```json
{
  "type": "PLAN_TRABAJO",
  "baseData": {
    "patientName": "Carlos Ruiz",
    "patientDocumentNumber": "11223344",
    "patientAge": 12,
    "patientDiagnosis": "TEA nivel 2"
  },
  "specificData": {
    "startDate": "2025-02-01",
    "endDate": "2025-07-31",
    "duration": 6,
    "generalObjectives": [
      {
        "id": "obj-1",
        "description": "Mejorar comunicación social",
        "priority": "HIGH",
        "indicators": "Iniciar conversaciones",
        "status": "PENDING"
      }
    ],
    "specificObjectives": [
      {
        "id": "obj-1-1",
        "description": "Saludar apropiadamente",
        "generalObjectiveId": "obj-1",
        "expectedOutcome": "Saludar en 8/10 interacciones",
        "evaluationCriteria": "Observación directa",
        "deadline": "2025-04-01",
        "status": "PENDING"
      }
    ],
    "methodology": {
      "approach": "Terapia conductual + TEACCH",
      "techniques": ["Modelado", "Refuerzo positivo"],
      "materials": ["Pictogramas", "Tablero de rutinas"],
      "frequency": "3 veces por semana",
      "sessionDuration": 45
    },
    "evaluationMethod": "Observación + registro de conductas",
    "evaluationFrequency": "Semanal"
  }
}
```

### Informe de Admisión

```json
{
  "type": "INFORME_ADMISION",
  "baseData": {
    "patientName": "Ana Martínez",
    "patientDocumentNumber": "55667788",
    "patientAge": 6,
    "patientDiagnosis": "Retraso en el desarrollo del lenguaje"
  },
  "specificData": {
    "admissionDate": "2025-01-10",
    "referralSource": "Pediatra Dr. García",
    "referralReason": "Dificultades en expresión oral",
    "patientAddress": "Calle Principal 123",
    "patientPhone": "987654321",
    "patientEmail": "contacto@familia.com",
    "diagnosis": {
      "primary": "Retraso simple del lenguaje",
      "secondary": [],
      "severity": "MODERATE",
      "prognosis": "FAVORABLE"
    },
    "assessmentTools": [
      {
        "name": "PLON-R",
        "date": "2025-01-10",
        "results": "Puntuación en percentil 20",
        "conclusions": "Retraso de 1.5 años"
      }
    ],
    "recommendations": {
      "interventionType": "Terapia del lenguaje individual",
      "frequency": "2 sesiones semanales",
      "duration": "6 meses iniciales"
    },
    "conclusions": "Se recomienda intervención inmediata..."
  }
}
```

Ver ejemplos completos de todos los formularios en:  
`docs/GUIA_CREACION_FORMULARIOS_POR_ROL.md`

---

## 🔔 Gestionar Notificaciones

### Ver Notificaciones No Leídas

```http
GET /api/v1/forms/workflow/notifications?status=UNREAD
Authorization: Bearer {tu_accessToken}
```

### Marcar Notificación como Leída

```http
PATCH /api/v1/forms/workflow/notifications/{notificationId}/read
Authorization: Bearer {tu_accessToken}
```

### Marcar Todas como Leídas

```http
PATCH /api/v1/forms/workflow/notifications/read-all
Authorization: Bearer {tu_accessToken}
```

### Ver Estadísticas de Notificaciones

```http
GET /api/v1/forms/workflow/notifications/stats
Authorization: Bearer {tu_accessToken}
```

---

## 🔍 Consultas Útiles

### Formularios Pendientes de Aprobación (Director)

```http
GET /api/v1/forms/workflow/pending
Authorization: Bearer {token_director}
```

### Mis Formularios por Estado

```http
GET /api/v1/forms/workflow/my-forms?status=APPROVED
Authorization: Bearer {tu_accessToken}
```

**Estados disponibles**: `DRAFT`, `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `ARCHIVED`

### Historial de un Formulario

```http
GET /api/v1/forms/workflow/{formId}/history
Authorization: Bearer {tu_accessToken}
```

### Versiones de un Formulario

```http
GET /api/v1/forms/workflow/{formId}/versions
Authorization: Bearer {tu_accessToken}
```

---

## 🎯 Casos de Uso Comunes

### Caso 1: Terapeuta Crea Plan de Trabajo

1. Login como terapeuta
2. Crear formulario `PLAN_TRABAJO` en DRAFT
3. Editar y completar datos
4. Enviar para revisión
5. Esperar aprobación del director
6. Recibir notificación de aprobación
7. Descargar PDF generado

### Caso 2: Director Revisa y Aprueba

1. Login como director
2. Ver notificación de formulario pendiente
3. Consultar formularios pendientes
4. Revisar formulario específico
5. Aprobar o rechazar con razón
6. El sistema genera PDF automáticamente (si se aprueba)
7. Notifica al creador

### Caso 3: Usuario Corrige Formulario Rechazado

1. Recibir notificación de rechazo con razón
2. Ver el formulario (estado REJECTED)
3. Leer la razón del rechazo
4. Editar el formulario
5. Volver a enviar para revisión
6. Esperar nueva revisión

---

## 🆘 Problemas Comunes

### Error: "Acceso denegado: el rol no puede crear formularios de tipo X"

**Solución**: Verifica la matriz de permisos. Tu rol quizás no tiene permiso para ese tipo de formulario.

### Error: "El formulario no puede ser enviado en su estado actual"

**Solución**: El formulario solo puede enviarse desde estado DRAFT o REJECTED.

### Error: "No tienes permisos para aprobar este formulario"

**Solución**: Solo los usuarios con rol DIRECTOR pueden aprobar formularios.

### Error al Validar Formulario

**Solución**: Revisa los campos obligatorios en la documentación de cada tipo de formulario.

---

## 📚 Documentación Completa

- **Índice General**: `docs/INDEX.md`
- **Guía de Formularios**: `docs/GUIA_CREACION_FORMULARIOS_POR_ROL.md`
- **Sistema de Autorización**: `docs/authorization-guide.md`
- **Funcionalidades**: `docs/RESUMEN_FUNCIONALIDADES.md`
- **Fase 1 Completada**: `docs/FASE_1_COMPLETADA.md`

---

## 🎊 ¡Listo!

Tu sistema Andamiaje API está configurado y listo para usar. 

**Próximo paso**: Crear tu primer formulario siguiendo los ejemplos anteriores.

---

**Última actualización**: Enero 2025  
**Versión**: 2.0

