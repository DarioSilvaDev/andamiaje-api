# Andamiaje API

API para gestión de formularios terapéuticos y administrativos con sistema de roles, workflow de aprobación y notificaciones automáticas. Construida con NestJS, TypeORM y PostgreSQL.

## 🚀 Características Principales

### Sistema de Autenticación y Autorización ✅

- **Autenticación JWT** con refresh tokens y rate limiting
- **5 Roles**: Director, Coordinador 1, Coordinador 2, Terapeuta, Acompañante Externo
- **Sistema de permisos granular** por tipo de formulario
- **Guards y decoradores** para protección de endpoints

### Sistema de Formularios v2 ✅

- **8 tipos de formularios** especializados
- **Arquitectura unificada** con BaseForm (Single Table Inheritance)
- **Versionado automático** de formularios
- **Datos de paciente embebidos** para mejor rendimiento

### Workflow de Aprobación ✅

- **Estados de formulario**: DRAFT → PENDING_REVIEW → APPROVED/REJECTED
- **Notificaciones automáticas** en cada cambio de estado
- **Sistema de auditoría completo** con historial de cambios
- **Permisos diferenciados** para creación, edición y aprobación

### Notificaciones en Tiempo Real ✅

- **Notificaciones in-app** automáticas al enviar, aprobar, rechazar o editar
- **Notificaciones por email** con templates HTML profesionales
- **Sistema de lectura/no lectura** con estadísticas
- **Filtros y paginación** de notificaciones
- **Integración completa** con el workflow

### Sistema de Email ✅

- **6 templates HTML responsive** para diferentes eventos
- **Integración automática** con el workflow de formularios
- **Múltiples proveedores**: Gmail, Outlook, SMTP personalizado
- **Configurable** por entorno (producción/desarrollo)
- **Logging detallado** de todos los envíos

### Documentación y Calidad ✅

- **Swagger/OpenAPI** para documentación interactiva
- **Validación automática** con class-validator
- **Logging estructurado** con Winston
- **Arquitectura modular** y escalable

## 🛠️ Tecnologías

- **Backend**: NestJS 10.x
- **Base de datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT + Passport
- **Validación**: class-validator + class-transformer
- **Logging**: Winston
- **Documentación**: Swagger/OpenAPI
- **Lenguaje**: TypeScript

## 📋 Prerrequisitos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## 🚀 Instalación

1. **Clonar el repositorio**

```bash
git clone <url-del-repositorio>
cd andamiaje-api
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_password
DB_DATABASE=andamiaje_db

# JWT
JWT_SECRET=tu_jwt_secret_super_seguro
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro
```

4. **Crear la base de datos**

```sql
CREATE DATABASE andamiaje_db;
```

5. **Ejecutar migraciones** (opcional en desarrollo)

```bash
npm run migration:run
```

6. **Iniciar la aplicación**

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📚 Documentación Completa

### 📖 Guías Disponibles

1. **[🚀 Guía de Inicio Rápido](docs/GUIA_INICIO_RAPIDO.md)** ⭐ **NUEVO**
   - Setup en 5 minutos
   - Primeros pasos
   - Ejemplos de uso inmediato
   - Casos de uso comunes

2. **[🎉 Fase 1 Completada](docs/FASE_1_COMPLETADA.md)** ⭐ **NUEVO**
   - Resumen de lo implementado
   - 8 formularios funcionales
   - Sistema de PDF integrado
   - Estadísticas de la implementación

3. **[Resumen de Funcionalidades](docs/RESUMEN_FUNCIONALIDADES.md)**
   - Estado actual del proyecto
   - Funcionalidades vigentes y funcionales ✅
   - Funcionalidades pendientes 🔴
   - Prioridades y roadmap

4. **[Guía de Creación de Formularios por Rol](docs/GUIA_CREACION_FORMULARIOS_POR_ROL.md)**
   - Matriz de permisos por rol
   - Especificación completa de cada tipo de formulario
   - Campos obligatorios y validaciones
   - Ejemplos de peticiones API
   - Reglas de negocio

5. **[Guía del Sistema de Autorización](docs/authorization-guide.md)**
   - Roles y permisos detallados
   - Guards y decoradores
   - Ejemplos de implementación
   - Debugging y troubleshooting

6. **[Índice de Documentación](docs/INDEX.md)**
   - Navegación completa de docs
   - Búsqueda por rol
   - Búsqueda por funcionalidad

## 🎯 Endpoints Principales

### Autenticación

- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/profile` - Obtener perfil
- `POST /api/v1/auth/logout` - Cerrar sesión

### Formularios

- `POST /api/v1/forms` - Crear formulario (según permisos de rol)
- `GET /api/v1/forms` - Listar formularios pendientes
- `GET /api/v1/forms/workflow/my-forms` - Mis formularios

### Workflow

- `POST /api/v1/forms/workflow/:id/submit` - Enviar para revisión
- `PATCH /api/v1/forms/workflow/:id/approve` - Aprobar (Director)
- `PATCH /api/v1/forms/workflow/:id/reject` - Rechazar (Director)
- `PATCH /api/v1/forms/workflow/:id/edit` - Editar formulario
- `GET /api/v1/forms/workflow/pending` - Formularios pendientes (Director)
- `GET /api/v1/forms/workflow/:id/history` - Historial del formulario
- `GET /api/v1/forms/workflow/:id/versions` - Versiones del formulario

### Notificaciones

- `GET /api/v1/forms/workflow/notifications` - Obtener notificaciones
- `PATCH /api/v1/forms/workflow/notifications/:id/read` - Marcar como leída
- `PATCH /api/v1/forms/workflow/notifications/read-all` - Marcar todas como leídas
- `GET /api/v1/forms/workflow/notifications/stats` - Estadísticas

### Documentación API

- `GET /api/docs` - Documentación Swagger interactiva

## 🔐 Roles y Permisos

### Director (Nivel 4)

- ✅ Todos los formularios
- ✅ Aprobar/Rechazar cualquier formulario
- ✅ Editar cualquier formulario
- ✅ Crear versiones
- ✅ Gestión de usuarios

### Coordinador 1 (Nivel 3)

- ✅ Informe Semestral, Admisión, Plan de Trabajo
- ✅ Seguimiento Acompañante, Actas, Factura
- ✅ Reporte Mensual
- ❌ No puede aprobar

### Coordinador 2 (Nivel 3)

- ✅ Seguimiento Familia, Actas, Factura
- ✅ Informe Semestral
- ❌ No puede aprobar

### Terapeuta (Nivel 2)

- ✅ Plan de Trabajo, Informe Semestral
- ✅ Actas, Factura, Informe Admisión
- ❌ No puede aprobar

### Acompañante Externo (Nivel 1)

- ✅ Reporte Mensual, Plan de Trabajo, Factura
- ❌ No puede aprobar

## 📋 Tipos de Formularios

| Tipo                        | Descripción                   | Roles Permitidos                           |
| --------------------------- | ----------------------------- | ------------------------------------------ |
| **ACTAS**                   | Actas de reunión              | Director, Coord. 1, Coord. 2, Terapeuta    |
| **PLAN_TRABAJO**            | Plan de trabajo terapéutico   | Director, Coord. 1, Terapeuta, Acomp. Ext. |
| **INFORME_SEMESTRAL**       | Informe semestral de progreso | Director, Coord. 1, Coord. 2, Terapeuta    |
| **INFORME_ADMISION**        | Informe de admisión           | Director, Coord. 1, Terapeuta              |
| **REPORTE_MENSUAL**         | Reporte mensual               | Director, Coord. 1, Acomp. Ext.            |
| **SEGUIMIENTO_ACOMPANANTE** | Seguimiento acompañante       | Director, Coord. 1                         |
| **SEGUIMIENTO_FAMILIA**     | Seguimiento familia           | Director, Coord. 2                         |
| **FACTURA**                 | Factura/Comprobante           | Todos                                      |

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuraciones (DB, logging, envs)
│   ├── envs.ts      # Variables de entorno con validación Joi
│   └── logger.config.ts
├── entities/         # Entidades de TypeORM
│   ├── base/        # Entidades base (v2)
│   │   ├── base-form.entity.ts          # Entidad base de formularios
│   │   ├── form-audit-log.entity.ts     # Auditoría
│   │   └── form-notification.entity.ts   # Notificaciones
│   ├── forms/       # Formularios específicos (v2)
│   │   └── acta-form-v2.entity.ts       # Formulario de Actas
│   ├── user.entity.ts
│   └── index.ts     # Barril de exportación
├── modules/          # Módulos de la aplicación
│   ├── auth/        # Autenticación y autorización
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── services/
│   │   └── strategies/
│   ├── users/       # Gestión de usuarios
│   ├── forms/       # Gestión de formularios
│   │   ├── controllers/
│   │   │   └── workflow.controller.ts
│   │   ├── services/
│   │   │   ├── workflow.service.ts
│   │   │   └── notification.service.ts
│   │   └── dto/
│   ├── printer/     # Generación de PDFs
│   └── storage/     # Almacenamiento de archivos
├── commons/         # Utilidades y constantes
│   ├── enums/       # Enumeraciones del sistema
│   └── types/       # Tipos TypeScript personalizados
├── factory/         # Factories de entidades
└── main.ts          # Punto de entrada

docs/                # Documentación del proyecto
├── RESUMEN_FUNCIONALIDADES.md
├── GUIA_CREACION_FORMULARIOS_POR_ROL.md
└── authorization-guide.md
```

## 🧪 Testing

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Scripts Disponibles

- `npm run start:dev` - Desarrollo con hot reload
- `npm run build` - Construir para producción
- `npm run start:prod` - Iniciar en modo producción
- `npm run migration:generate` - Generar migración
- `npm run migration:run` - Ejecutar migraciones
- `npm run migration:revert` - Revertir última migración

## 🔧 Configuración

### Variables de Entorno

| Variable     | Descripción             | Default   |
| ------------ | ----------------------- | --------- |
| `PORT`       | Puerto de la aplicación | 5001      |
| `DB_HOST`    | Host de PostgreSQL      | localhost |
| `DB_PORT`    | Puerto de PostgreSQL    | 5432      |
| `JWT_SECRET` | Secreto para JWT        | Requerido |

### Base de Datos

La aplicación usa TypeORM con PostgreSQL. Las entidades principales son:

#### Entidades v2 (Actuales):

- **User**: Usuarios con roles múltiples y autenticación
- **BaseForm**: Entidad base de todos los formularios (v2)
- **ActaFormV2**: Formularios de actas de reunión
- **FormAuditLog**: Registro de auditoría de cambios
- **FormNotification**: Sistema de notificaciones

#### Estados de Formulario:

- `DRAFT`: Borrador en edición
- `PENDING_REVIEW`: Enviado para revisión
- `APPROVED`: Aprobado por director
- `REJECTED`: Rechazado (puede volver a DRAFT)
- `ARCHIVED`: Archivado

#### Workflow:

```
DRAFT → PENDING_REVIEW → APPROVED
           ↓
       REJECTED → (editar) → DRAFT
```

## 🚀 Despliegue

1. **Configurar variables de producción**
2. **Construir la aplicación**: `npm run build`
3. **Configurar base de datos de producción**
4. **Ejecutar migraciones**: `npm run migration:run`
5. **Iniciar**: `npm run start:prod`

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo.
