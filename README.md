# Andamiaje API

API backend en NestJS para onboarding de usuarios, gestion de formularios, revision documental con PDF y almacenamiento en B2/S3.

## Estado actual

- Autenticacion JWT con modo hibrido (cookies httpOnly + Bearer)
- Flujo de cuenta por estados: `PENDING_APPROVAL -> PENDING_SIGNATURE -> ACTIVE` (con `REJECTED` y `DISABLED`)
- Guard global JWT con soporte de rutas publicas (`@Public()`)
- Validacion global de DTOs y formato de errores consistente
- Flujo de formularios con aprobacion/rechazo, generacion de PDF, persistencia en `documents` y auditoria de revisiones
- Storage en B2/S3 con ownership y validacion estricta de tipo de archivo
- Notificaciones desacopladas via event bus interno + provider reemplazable

## Stack tecnico

- NestJS 10
- TypeORM + PostgreSQL
- JWT + Passport
- class-validator + class-transformer
- Swagger/OpenAPI
- PDFMake
- AWS SDK v3 (compatible B2 S3 API)

## Requisitos

- Node.js 18+
- PostgreSQL 12+
- npm

## Instalacion rapida

1. Instalar dependencias

```bash
npm install
```

2. Crear `.env` desde `env.example` y completar valores requeridos

Variables clave obligatorias:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `B2_ENDPOINT`
- `B2_REGION`
- `B2_BUCKET`
- `B2_KEY_ID`
- `B2_APP_KEY`
- `B2_BUCKET_ID`

3. Ejecutar migraciones

```bash
npm run migration:run
```

4. Levantar la API

```bash
npm run start:dev
```

## Configuracion

Variables importantes:

- `PORT` (default `5001`)
- `API_PREFIX` (default `api/v1`)
- `ALLOWED_ORIGINS` (CSV de origenes permitidos para CORS)
- `DB_SYNCHRONIZE` (recomendado `false`)
- `DB_LOGGING`
- `DB_SSL` (default `true`)
- `ALLOWED_FILE_TYPES` (default `pdf,jpg,jpeg,png`)

Swagger:

- `GET /api/docs`

Health:

- `GET /api/v1/`

## Endpoints principales

Base URL por defecto: `http://localhost:5001/api/v1`

### Auth

- `POST /auth/register`
- `POST /auth/reapply`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/profile`
- `POST /auth/logout`

### Users

- `POST /users` (solo director)
- `GET /users`
- `GET /users/pending` (solo director)
- `PATCH /users/:id/review` (solo director)
- `GET /users/:id` (ownership)
- `PUT /users/:id` (ownership)
- `DELETE /users/:id` (ownership, desactivacion logica)

### Forms

- `POST /forms`
- `GET /forms`
- `GET /forms/pending` (solo director)
- `GET /forms/:id` (ownership)
- `PATCH /forms/:id/review` (solo director)

### Storage

- `POST /storage/upload?type=<TIPO>`
- `GET /storage/download?key=<KEY>`
- `GET /storage/file/:key`
- `DELETE /storage/file?key=<KEY>`
- `DELETE /storage/file/:key`

## Tipos de formulario soportados

- `ACTAS`
- `INFORME_ADMISION`
- `PLAN_TRABAJO`
- `INFORME_SEMESTRAL`
- `REPORTE_MENSUAL`
- `SEGUIMIENTO_ACOMPANIANTE_EXTERNO`
- `SEGUIMIENTO_FAMILIA`
- `FACTURA`

Cada revision (`PATCH /forms/:id/review`) genera/actualiza:

- estado en `documents`
- PDF (si aprobado)
- registro de auditoria en `form_review_audits`
- historial de revision en la respuesta (`review.history`)

## Scripts utiles

- `npm run start:dev`
- `npm run build`
- `npm run start:prod`
- `npm run test`
- `npm run test:cov`
- `npm run migration:generate`
- `npm run migration:run`
- `npm run migration:revert`
- `npm run migration:show`

## Estructura del proyecto

```text
src/
  commons/         # filtros, interceptores, constantes
  config/          # envs, CORS, DB data source
  entities/        # modelos TypeORM
  factory/         # fabrica de formularios por tipo
  migrations/      # migraciones de base de datos
  modules/
    auth/          # login, refresh, guards, decorators
    users/         # CRUD y aprobacion de usuarios
    forms/         # alta/revision/listado de formularios
    storage/       # subida/descarga/eliminacion de archivos
    notifications/ # event bus y provider de notificaciones
    printer/       # generacion de PDFs
    pdfReports/    # builders PDF por tipo
  repositories/    # repositorios custom
  main.ts
```

## Testing

Actualmente hay cobertura unitaria en auth/guards.

```bash
npm run test
```

## Notas de despliegue

- Usar `DB_SYNCHRONIZE=false` en ambientes no locales
- Ejecutar migraciones en cada release
- Configurar `ALLOWED_ORIGINS` segun el frontend real
- Mantener secretos (`JWT_*`, `B2_*`, `DATABASE_URL`) fuera del repo
