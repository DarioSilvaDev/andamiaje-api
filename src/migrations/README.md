# 📁 Migraciones de TypeORM

Este directorio contiene todas las migraciones de base de datos del proyecto.

## 🎯 **Scripts Disponibles**

### **Generar migración automáticamente**

```bash
npm run migration:generate
```

Genera una migración basada en los cambios detectados en las entidades.

### **Crear migración vacía**

```bash
npm run migration:create
```

Crea un archivo de migración vacío para escribir manualmente.

### **Ejecutar migraciones pendientes**

```bash
npm run migration:run
```

Ejecuta todas las migraciones que aún no han sido aplicadas.

### **Revertir última migración**

```bash
npm run migration:revert
```

Revierte la última migración ejecutada.

### **Ver estado de migraciones**

```bash
npm run migration:show
```

Muestra qué migraciones están pendientes y cuáles ya fueron ejecutadas.

### **Eliminar esquema completo (⚠️ CUIDADO)**

```bash
npm run schema:drop
```

Elimina todas las tablas de la base de datos. **Solo usar en desarrollo**.

### **Sincronizar esquema (⚠️ CUIDADO)**

```bash
npm run schema:sync
```

Sincroniza el esquema de la base de datos con las entidades. **Solo usar en desarrollo**.

## 📋 **Flujo de Trabajo**

### **1. Crear/Modificar Entidades**

Agrega o modifica entidades en `src/entities/`.

### **2. Generar Migración**

```bash
npm run migration:generate
```

### **3. Revisar Migración**

Verifica el archivo generado en `src/migrations/`.

### **4. Ejecutar Migración**

```bash
npm run migration:run
```

### **5. Verificar Estado**

```bash
npm run migration:show
```

## ⚠️ **Consideraciones Importantes**

1. **NUNCA** uses `synchronize: true` en producción
2. **SIEMPRE** revisa las migraciones generadas antes de ejecutarlas
3. **SIEMPRE** prueba las migraciones en un entorno de desarrollo primero
4. **NUNCA** modifiques migraciones que ya fueron ejecutadas en producción
5. **SIEMPRE** usa migraciones para cambios de esquema

## 🏗️ **Arquitectura de Entidades**

### **Entidades v2 (Nueva Arquitectura)**

- `BaseForm` - Entidad base para formularios con workflow
- `FormAuditLog` - Registro de auditoría
- `FormNotification` - Sistema de notificaciones
- `ActaFormV2` - Formulario específico de ACTAS

### **Entidades v1 (Legacy)**

- `FormEntity` - Formulario genérico antiguo
- `ActaForm` - ACTAS antigua
- `AdmissionForm` - Informes de admisión
- `PlanForm` - Planes de trabajo
- `SemestralReportForm` - Informes semestrales

**Nota:** Las entidades v1 se mantendrán temporalmente para compatibilidad pero serán migradas a la nueva arquitectura v2.

## 📊 **Tabla de Migraciones**

TypeORM mantiene un registro de migraciones ejecutadas en la tabla `typeorm_migrations`.

```sql
SELECT * FROM typeorm_migrations ORDER BY timestamp DESC;
```

## 🔧 **Configuración**

La configuración de migraciones está en `src/config/typeorm.config.ts`.

## 🚀 **Ejemplo de Uso**

```bash
# 1. Crear nueva entidad
# 2. Generar migración
npm run migration:generate

# 3. Revisar archivo generado
# 4. Ejecutar migración
npm run migration:run

# 5. Verificar
npm run migration:show
```

## 📝 **Notas de Desarrollo**

- Las migraciones se compilan a `dist/migrations/`
- Asegúrate de compilar el proyecto antes de ejecutar migraciones en producción
- Usa nombres descriptivos para tus migraciones
- Documenta cambios complejos dentro del código de migración
