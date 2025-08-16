# Guía del Sistema de Autorización

## 🎯 Descripción General

El sistema de autorización de Andamiaje API proporciona un control granular de acceso basado en roles y permisos. Está diseñado para ser flexible, seguro y fácil de usar.

## 🔐 Roles del Sistema

### 1. **Director** (Nivel 4)

- **Acceso**: Completo al sistema
- **Permisos**: Todos los permisos disponibles
- **Funciones**: Gestión de usuarios, aprobación de documentos, administración del sistema

### 2. **Coordinador** (Nivel 3)

- **Acceso**: Limitado a recursos propios y algunos recursos del sistema
- **Permisos**: Gestión de documentos propios, lectura de documentos aprobados
- **Funciones**: Coordinación de actividades, gestión de documentos

### 3. **Terapeuta** (Nivel 2)

- **Acceso**: Limitado a recursos propios
- **Permisos**: Gestión de documentos propios, lectura de documentos aprobados
- **Funciones**: Creación y gestión de documentos terapéuticos

### 4. **Acompañante Externo** (Nivel 1)

- **Acceso**: Limitado a recursos propios
- **Permisos**: Gestión de documentos propios, lectura de documentos aprobados
- **Funciones**: Creación y gestión de documentos de acompañamiento

## 🛡️ Componentes del Sistema

### Guards

#### `JwtAuthGuard`

- **Propósito**: Verifica la autenticación JWT
- **Uso**: Protege endpoints que requieren autenticación

#### `RolesGuard`

- **Propósito**: Verifica roles específicos
- **Uso**: Se puede usar independientemente para verificar solo roles

#### `AuthRolesGuard`

- **Propósito**: Combina autenticación JWT y verificación de roles
- **Uso**: Protege endpoints que requieren autenticación y roles específicos

#### `OwnerGuard`

- **Propósito**: Verifica propiedad de recursos
- **Uso**: Asegura que solo el propietario o usuarios con roles superiores puedan acceder

### Decoradores

#### `@Roles(...roles)`

```typescript
@Get('admin-only')
@Roles(UserRole.DIRECTOR)
adminOnlyEndpoint() {
  return { message: 'Solo directores pueden ver esto' };
}
```

#### `@OwnerCheck(config)`

```typescript
@Put('document/:id')
@OwnerCheck({
  entityName: 'Document',
  idField: 'id',
  ownerField: 'createdById',
})
updateOwnDocument() {
  return { message: 'Documento actualizado' };
}
```

#### `@CurrentUser()`

```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;
}
```

## 📋 Ejemplos de Uso

### 1. Endpoint Solo para Directores

```typescript
@Controller("admin")
@UseGuards(JwtAuthGuard, AuthRolesGuard)
export class AdminController {
  @Get("users")
  @Roles(UserRole.DIRECTOR)
  @ApiOperation({ summary: "Listar usuarios (solo directores)" })
  listUsers() {
    return this.userService.findAll();
  }
}
```

### 2. Endpoint para Múltiples Roles

```typescript
@Controller("documents")
@UseGuards(JwtAuthGuard, AuthRolesGuard)
export class DocumentController {
  @Get("management")
  @Roles(UserRole.DIRECTOR, UserRole.COORDINADOR)
  @ApiOperation({ summary: "Para directores y coordinadores" })
  getManagementDocuments() {
    return this.documentService.findManagementDocuments();
  }
}
```

### 3. Endpoint con Verificación de Propiedad

```typescript
@Controller("documents")
@UseGuards(JwtAuthGuard, AuthRolesGuard, OwnerGuard)
export class DocumentController {
  @Put(":id")
  @Roles(UserRole.TERAPEUTA, UserRole.ACOMPANIANTE_EXTERNO)
  @OwnerCheck({
    entityName: "Document",
    idField: "id",
    ownerField: "createdById",
  })
  updateDocument(
    @Param("id") id: string,
    @Body() updateDto: UpdateDocumentDto
  ) {
    return this.documentService.update(id, updateDto);
  }
}
```

### 4. Endpoint para Cualquier Usuario Autenticado

```typescript
@Controller("profile")
@UseGuards(JwtAuthGuard)
export class ProfileController {
  @Get()
  @ApiOperation({ summary: "Para cualquier usuario autenticado" })
  getProfile(@CurrentUser() user: User) {
    return user;
  }
}
```

## 🔧 Configuración de Permisos

### Estructura de Permisos

Los permisos siguen el formato: `recurso:accion[:alcance]`

- **recurso**: Tipo de recurso (users, documents, files, reports)
- **accion**: Acción a realizar (read, write, delete, approve, reject)
- **alcance**: Opcional, especifica el alcance (own = propio)

### Ejemplos de Permisos

```typescript
// Permisos del Director
"users:read"; // Leer todos los usuarios
"users:write"; // Crear/editar usuarios
"documents:approve"; // Aprobar documentos
"documents:reject"; // Rechazar documentos

// Permisos de otros roles
"users:read:own"; // Leer solo información propia
"documents:write:own"; // Crear/editar documentos propios
"files:delete:own"; // Eliminar archivos propios
```

## 🚀 Implementación en Nuevos Módulos

### 1. Importar los Guards Necesarios

```typescript
import { JwtAuthGuard } from "@/modules/auth/guards/jwt-auth.guard";
import { AuthRolesGuard } from "@/modules/auth/guards/auth-roles.guard";
import { Roles } from "@/modules/auth/decorators/roles.decorator";
import { UserRole } from "@/entities/user.entity";
```

### 2. Aplicar Guards a Nivel de Controlador

```typescript
@Controller("example")
@UseGuards(JwtAuthGuard, AuthRolesGuard)
export class ExampleController {
  // Todos los endpoints requieren autenticación y verificación de roles
}
```

### 3. Aplicar Roles a Nivel de Método

```typescript
@Get('admin')
@Roles(UserRole.DIRECTOR)
adminEndpoint() {
  // Solo directores pueden acceder
}
```

## 📊 Logging y Auditoría

### Interceptor de Logging

El sistema incluye un interceptor que registra:

- Usuario que accede
- Endpoint accedido
- Tiempo de respuesta
- Errores de autorización

### Middleware de Logging

Registra información adicional:

- IP del usuario
- User-Agent
- Timestamp de acceso
- Estado de autenticación

## ⚠️ Consideraciones de Seguridad

### 1. **Validación de Propiedad**

- Siempre verificar que el usuario sea propietario del recurso
- Usar `@OwnerCheck` para recursos que pertenecen a usuarios específicos

### 2. **Verificación de Roles**

- No confiar solo en el frontend para verificar permisos
- Implementar verificaciones tanto en el guard como en el servicio

### 3. **Logging de Seguridad**

- Registrar todos los intentos de acceso
- Monitorear patrones sospechosos
- Mantener auditoría completa de acciones

## 🔍 Debugging y Troubleshooting

### Problemas Comunes

#### Error: "ForbiddenException: Acceso denegado"

- Verificar que el usuario esté autenticado
- Verificar que el usuario tenga el rol requerido
- Verificar que el usuario sea propietario del recurso (si aplica)

#### Error: "UnauthorizedException: Token inválido"

- Verificar que el token JWT sea válido
- Verificar que el token no haya expirado
- Verificar que el secreto JWT sea correcto

### Logs de Debug

```typescript
// Habilitar logs detallados
@UseGuards(JwtAuthGuard, AuthRolesGuard)
@Roles(UserRole.DIRECTOR)
@UseInterceptors(AuthLoggingInterceptor)
debugEndpoint() {
  // Los logs mostrarán información detallada de autorización
}
```

## 📚 Recursos Adicionales

- **Entidades**: Ver `src/entities/` para entender la estructura de datos
- **Servicios**: Ver `src/modules/auth/services/` para lógica de autorización
- **Constantes**: Ver `src/commons/constants/` para permisos y roles
- **Ejemplos**: Ver `src/commons/examples/` para casos de uso prácticos

## 🎉 Conclusión

El sistema de autorización proporciona una base sólida y flexible para controlar el acceso a los recursos de la API. Es fácil de usar, seguro y extensible para futuras necesidades.
