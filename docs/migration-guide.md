# 🚀 Guía de Migraciones - Arquitectura v2

## 📋 **Índice**

1. [Preparación](#preparación)
2. [Generación de Migraciones](#generación-de-migraciones)
3. [Ejecución de Migraciones](#ejecución-de-migraciones)
4. [Verificación](#verificación)
5. [Troubleshooting](#troubleshooting)

## 🎯 **Preparación**

### **1. Verificar Configuración**

Asegúrate de que tu archivo `.env` tenga las siguientes variables:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=andamiaje
DB_PASSWORD=andamiaje
DB_DATABASE=andamiaje_dev
DB_SYNCHRONIZE=false
DB_LOGGING=true

# Node
NODE_ENV=development
```

### **2. Verificar Dependencias**

```bash
npm install
```

### **3. Compilar Proyecto**

```bash
npm run build
```

## 📦 **Generación de Migraciones**

### **Opción 1: Generación Automática (Recomendada)**

TypeORM comparará tus entidades con el esquema actual de la base de datos y generará la migración automáticamente:

```bash
npm run migration:generate
```

Este comando creará un archivo en `src/migrations/` con un timestamp, por ejemplo:

```
src/migrations/Migration1234567890123.ts
```

### **Opción 2: Creación Manual**

Si necesitas crear una migración vacía para escribir manualmente:

```bash
npm run migration:create
```

## ▶️ **Ejecución de Migraciones**

### **1. Ver Estado Actual**

Antes de ejecutar, verifica qué migraciones están pendientes:

```bash
npm run migration:show
```

Salida esperada:

```
✔ Migration1234567890123 (PENDING)
✔ Migration1234567890124 (PENDING)
```

### **2. Ejecutar Migraciones Pendientes**

```bash
npm run migration:run
```

Salida esperada:

```
query: SELECT * FROM "typeorm_migrations" "typeorm_migrations"
0 migrations are already loaded in the database.
2 migrations were found in the source code.
2 migrations are new migrations must be executed.

Migration1234567890123 has been executed successfully.
Migration1234567890124 has been executed successfully.
```

### **3. Verificar Ejecución**

```bash
npm run migration:show
```

Salida esperada:

```
✔ Migration1234567890123 (EXECUTED)
✔ Migration1234567890124 (EXECUTED)
```

## ✅ **Verificación**

### **1. Verificar Tablas Creadas**

Conéctate a tu base de datos y verifica que las tablas fueron creadas:

```sql
-- Verificar tablas v2
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Debe mostrar:
-- forms_v2
-- form_audit_logs
-- form_notifications
-- acta_forms_v2
-- typeorm_migrations
```

### **2. Verificar Estructura de Tablas**

```sql
-- Ver estructura de forms_v2
\d forms_v2

-- Ver estructura de form_audit_logs
\d form_audit_logs

-- Ver estructura de form_notifications
\d form_notifications

-- Ver estructura de acta_forms_v2
\d acta_forms_v2
```

### **3. Verificar Índices**

```sql
-- Verificar índices creados
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('forms_v2', 'form_audit_logs', 'form_notifications', 'acta_forms_v2')
ORDER BY tablename, indexname;
```

### **4. Verificar Foreign Keys**

```sql
-- Verificar relaciones
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('forms_v2', 'form_audit_logs', 'form_notifications', 'acta_forms_v2');
```

## 🔄 **Revertir Migraciones**

### **Revertir Última Migración**

Si algo sale mal, puedes revertir la última migración ejecutada:

```bash
npm run migration:revert
```

**⚠️ ADVERTENCIA:** Esto ejecutará el método `down()` de la última migración.

### **Revertir Múltiples Migraciones**

Ejecuta el comando varias veces:

```bash
npm run migration:revert
npm run migration:revert
npm run migration:revert
```

## 🛠️ **Troubleshooting**

### **Error: "Cannot find module"**

**Problema:** No se encuentran los archivos compilados.

**Solución:**

```bash
npm run build
npm run migration:run
```

### **Error: "relation already exists"**

**Problema:** La tabla ya existe en la base de datos.

**Solución 1 (Desarrollo):**

```bash
# Eliminar todas las tablas y empezar de nuevo
npm run schema:drop
npm run migration:run
```

**Solución 2 (Producción):**
Verifica qué migraciones ya están ejecutadas:

```bash
npm run migration:show
```

Si la migración ya fue ejecutada, no necesitas hacer nada.

### **Error: "QueryFailedError: column does not exist"**

**Problema:** La migración no se generó correctamente o hay un desajuste entre entidades y BD.

**Solución:**

1. Revertir la migración problemática
2. Verificar que las entidades estén correctamente definidas
3. Generar nueva migración
4. Ejecutar nuevamente

```bash
npm run migration:revert
npm run migration:generate
npm run migration:run
```

### **Error: "ECONNREFUSED" o "Connection timeout"**

**Problema:** No se puede conectar a la base de datos.

**Solución:**

1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `.env`
3. Verificar que el host y puerto sean correctos

```bash
# Verificar conexión manual
psql -h localhost -U andamiaje -d andamiaje_dev
```

### **Error: "Cannot read properties of undefined"**

**Problema:** Faltan variables de entorno.

**Solución:**
Verificar que todas las variables de entorno estén definidas en `.env`:

```bash
cat .env | grep DB_
```

## 📊 **Estructura de Migración**

Una migración generada tiene esta estructura:

```typescript
import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1234567890123 implements MigrationInterface {
  name = "Migration1234567890123";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cambios a aplicar (crear tablas, agregar columnas, etc.)
    await queryRunner.query(`CREATE TABLE "forms_v2" (...)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cambios a revertir (eliminar tablas, quitar columnas, etc.)
    await queryRunner.query(`DROP TABLE "forms_v2"`);
  }
}
```

## 🎯 **Flujo Completo de Trabajo**

```bash
# 1. Crear/modificar entidades en src/entities/

# 2. Generar migración
npm run migration:generate

# 3. Revisar archivo generado en src/migrations/

# 4. Compilar proyecto
npm run build

# 5. Ver estado
npm run migration:show

# 6. Ejecutar migración
npm run migration:run

# 7. Verificar en la base de datos
psql -h localhost -U andamiaje -d andamiaje_dev

# 8. Si hay problemas, revertir
npm run migration:revert
```

## 📝 **Buenas Prácticas**

1. **SIEMPRE** revisa las migraciones generadas antes de ejecutarlas
2. **SIEMPRE** prueba las migraciones en desarrollo primero
3. **NUNCA** modifiques migraciones que ya fueron ejecutadas en producción
4. **SIEMPRE** usa `migration:revert` en lugar de editar migraciones ejecutadas
5. **SIEMPRE** crea backups antes de ejecutar migraciones en producción
6. **NUNCA** uses `synchronize: true` en producción
7. **SIEMPRE** documenta cambios complejos en las migraciones

## 🚀 **Despliegue a Producción**

```bash
# 1. Compilar proyecto
npm run build

# 2. Subir código a producción

# 3. En el servidor de producción, ejecutar migraciones
npm run migration:run

# 4. Iniciar aplicación
npm run start:prod
```

## 📞 **Soporte**

Si encuentras problemas no cubiertos en esta guía, revisa:

1. Logs de TypeORM
2. Logs de PostgreSQL
3. Documentación oficial de TypeORM: https://typeorm.io/migrations
