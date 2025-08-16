# Andamiaje API

API para gestión de usuarios y archivos con sistema de roles, construida con NestJS, TypeORM y PostgreSQL.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **Sistema de roles**: Director, Terapeuta, Acompañante Externo, Coordinador
- **Gestión de documentos** con estados de aprobación
- **Carga de archivos** con validaciones
- **Generación automática de PDFs** para documentos aprobados
- **Logging centralizado** con Winston
- **Validación de datos** con class-validator
- **Documentación automática** con Swagger
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

## 📚 Endpoints de la API

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `GET /api/v1/auth/profile` - Obtener perfil
- `POST /api/v1/auth/logout` - Cerrar sesión

### Documentación
- `GET /api/docs` - Documentación Swagger

## 🔐 Roles y Permisos

- **Director**: Acceso completo, puede aprobar documentos
- **Terapeuta**: Crear y editar documentos propios
- **Acompañante Externo**: Crear y editar documentos propios
- **Coordinador**: Crear y editar documentos propios

## 📁 Estructura del Proyecto

```
src/
├── config/           # Configuraciones (DB, logging, envs)
├── entities/         # Entidades de TypeORM
├── repositories/     # Repositorios personalizados
├── modules/          # Módulos de la aplicación
│   ├── auth/         # Autenticación y autorización
│   ├── users/        # Gestión de usuarios
│   └── documents/    # Gestión de documentos
├── commons/          # Utilidades y constantes
└── main.ts           # Punto de entrada
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

| Variable | Descripción | Default |
|----------|-------------|---------|
| `PORT` | Puerto de la aplicación | 5001 |
| `DB_HOST` | Host de PostgreSQL | localhost |
| `DB_PORT` | Puerto de PostgreSQL | 5432 |
| `JWT_SECRET` | Secreto para JWT | Requerido |
| `UPLOAD_DEST` | Directorio de uploads | ./uploads |

### Base de Datos

La aplicación usa TypeORM con PostgreSQL. Las entidades principales son:

- **User**: Usuarios con roles y autenticación
- **Document**: Documentos con estados de aprobación
- **DocumentFile**: Archivos adjuntos a documentos

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