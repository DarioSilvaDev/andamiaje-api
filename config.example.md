# Configuración de la Base de Datos

## 1. Crear archivo .env

Copia el archivo `env.example` a `.env` y configura las variables:

```bash
cp env.example .env
```

## 2. Configurar PostgreSQL

### Opción A: Usando Docker (Recomendado para desarrollo)

```bash
# Crear contenedor PostgreSQL
docker run --name andamiaje-postgres \
  -e POSTGRES_DB=andamiaje_db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15

# Verificar que esté corriendo
docker ps
```

### Opción B: Instalación local

1. Instalar PostgreSQL desde https://www.postgresql.org/download/
2. Crear base de datos:

```sql
CREATE DATABASE andamiaje_db;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE andamiaje_db TO postgres;
```

## 3. Variables de Entorno Requeridas

```env
# Base de datos (REQUERIDAS)
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=andamiaje_db

# JWT (REQUERIDAS)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_aqui
```

## 4. Probar la Aplicación

```bash
# Instalar dependencias
npm install

# Compilar
npm run build

# Crear usuario administrador (después de configurar DB)
npm run create:admin

# Iniciar en desarrollo
npm run start:dev
```

## 5. Acceder a la API

- **API**: http://localhost:5001/api/v1
- **Documentación**: http://localhost:5001/api/docs
- **Login por defecto**: admin / admin123

## 6. Estructura de la Base de Datos

La aplicación creará automáticamente las siguientes tablas:

- `users` - Usuarios del sistema
- `documents` - Documentos con estados de aprobación
- `document_files` - Archivos adjuntos a documentos

## 7. Solución de Problemas

### Error de conexión a PostgreSQL

- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos exista

### Error de compilación

- Verificar que todas las dependencias estén instaladas
- Verificar que TypeScript esté configurado correctamente

### Error de permisos

- Verificar que el usuario de PostgreSQL tenga permisos en la base de datos
