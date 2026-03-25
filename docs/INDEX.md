# 📚 Índice de Documentación - Andamiaje API

## 📖 Guía de Navegación

Esta es la documentación completa del proyecto Andamiaje API. A continuación encontrarás todos los documentos organizados por categoría y propósito.

---

## 🎯 Para Empezar

### 1. [README Principal](../README.md)

**Propósito**: Visión general del proyecto y setup inicial  
**Audiencia**: Nuevos desarrolladores, DevOps  
**Contenido**:

- Características principales del sistema
- Instalación y configuración
- Endpoints principales
- Roles y permisos
- Estructura del proyecto
- Scripts disponibles

### 2. [Resumen Ejecutivo](RESUMEN_EJECUTIVO.md)

**Propósito**: Vista rápida del estado del proyecto  
**Audiencia**: Project Managers, Stakeholders, Líderes técnicos  
**Contenido**:

- ✅ Lo que está funcionando
- ⚠️ Lo que no está funcionando
- 🔴 Lo que falta implementar
- Roadmap y prioridades
- Métricas de éxito
- Riesgos identificados

---

## 📋 Documentación Funcional

### 3. [Resumen de Funcionalidades](RESUMEN_FUNCIONALIDADES.md)

**Propósito**: Estado detallado de todas las funcionalidades  
**Audiencia**: Desarrolladores, QA, Product Owners  
**Contenido**:

- Funcionalidades vigentes y funcionales (✅)
- Funcionalidades vigentes pero no funcionales (⚠️)
- Funcionalidades pendientes (🔴)
- Descripción técnica de cada componente
- Recomendaciones de implementación
- Prioridades por fase

**Secciones principales**:

- ✅ Sistema de Autenticación y Autorización
- ✅ Sistema de Gestión de Usuarios
- ✅ Sistema Base de Formularios (v2)
- ✅ Sistema de Workflow de Formularios
- ✅ Sistema de Notificaciones
- ✅ Sistema de Auditoría
- ✅ Formulario ACTAS (v2)
- ✅ Sistema de Control de Permisos por Rol
- ⚠️ Formularios Legacy (v1)
- ⚠️ Sistema de Generación de PDF
- ⚠️ Sistema de Almacenamiento
- 🔴 Formularios Específicos v2 (pendientes)
- 🔴 Sistema de Adjuntos
- 🔴 Sistema de Firma Digital
- 🔴 Dashboard y Reportes

### 4. [Guía de Creación de Formularios por Rol](GUIA_CREACION_FORMULARIOS_POR_ROL.md)

**Propósito**: Manual completo para crear formularios según rol  
**Audiencia**: Desarrolladores frontend, QA, Usuarios técnicos  
**Contenido**:

- Matriz de permisos por rol
- Especificación completa de cada tipo de formulario
- Campos obligatorios y opcionales
- Validaciones detalladas
- Ejemplos de peticiones API
- Reglas de negocio
- Códigos de respuesta

**Formularios documentados**:

1. ACTAS (Actas de Reunión) ✅
2. PLAN_TRABAJO (Plan de Trabajo Terapéutico)
3. INFORME_SEMESTRAL (Informe Semestral de Progreso)
4. INFORME_ADMISION (Informe de Admisión)
5. REPORTE_MENSUAL (Reporte Mensual)
6. SEGUIMIENTO_ACOMPANANTE (Seguimiento Acompañante Externo)
7. SEGUIMIENTO_FAMILIA (Seguimiento Familia)
8. FACTURA (Factura/Comprobante)

---

## 🔒 Documentación de Seguridad

### 5. [Guía del Sistema de Autorización](authorization-guide.md)

**Propósito**: Entender e implementar el sistema de autorización  
**Audiencia**: Desarrolladores backend, Arquitectos  
**Contenido**:

- Roles del sistema (Director, Coordinadores, Terapeuta, Acompañante)
- Guards de autorización
- Decoradores personalizados
- Ejemplos de implementación
- Configuración de permisos
- Logging y auditoría
- Consideraciones de seguridad
- Debugging y troubleshooting

**Componentes explicados**:

- `JwtAuthGuard`
- `RolesGuard`
- `AuthRolesGuard`
- `OwnerGuard`
- `@Roles()` decorator
- `@OwnerCheck()` decorator
- `@CurrentUser()` decorator
- `AuthorizationService`

---

## 🏗️ Documentación Técnica

### 6. [Sistema de Notificaciones por Email](SISTEMA_EMAIL.md) ⭐

**Propósito**: Guía completa del sistema de email  
**Audiencia**: Desarrolladores, DevOps  
**Contenido**:

- Configuración de email (Gmail, Outlook, SMTP)
- 6 templates HTML responsive
- Integración con workflow
- Uso del servicio de email
- Personalización de templates
- Troubleshooting y testing
- Estadísticas y logs

**Casos de uso**:

- Formulario enviado para revisión
- Formulario aprobado (con PDF)
- Formulario rechazado
- Formulario editado por director
- Bienvenida de nuevo usuario
- Contraseña cambiada

### 7. Arquitectura del Sistema (Pendiente)

**Propósito**: Diseño y decisiones arquitectónicas  
**Audiencia**: Arquitectos, Senior Developers  
**Contenido planeado**:

- Diagrama de arquitectura
- Patrones de diseño utilizados
- Decisiones técnicas clave
- Flujos de datos
- Diagramas de secuencia

### 7. Guía de Base de Datos (Pendiente)

**Propósito**: Estructura y relaciones de la base de datos  
**Audiencia**: DBAs, Backend Developers  
**Contenido planeado**:

- Diagrama ER
- Descripción de tablas
- Índices y optimizaciones
- Migraciones
- Backups y restauración

### 8. Guía de APIs (Disponible en Swagger)

**Propósito**: Documentación interactiva de endpoints  
**Audiencia**: Frontend Developers, Integradores  
**Acceso**: `http://localhost:5001/api/docs`  
**Contenido**:

- Todos los endpoints documentados
- Parámetros y respuestas
- Ejemplos de uso
- Códigos de error
- Autenticación

---

## 🎨 Guías de Desarrollo

### 9. Convenciones de Código (Pendiente)

**Propósito**: Estándares y mejores prácticas  
**Audiencia**: Todo el equipo de desarrollo  
**Contenido planeado**:

- Naming conventions
- Estructura de archivos
- Patrones de código
- ESLint y Prettier
- Git workflow

### 10. Guía de Testing (Pendiente)

**Propósito**: Cómo escribir y ejecutar tests  
**Audiencia**: Desarrolladores, QA  
**Contenido planeado**:

- Tests unitarios
- Tests de integración
- Tests e2e
- Coverage
- Mocking y fixtures

---

## 📝 Casos de Uso

### 11. Flujos de Trabajo Documentados

#### Flujo 1: Crear y Aprobar un Formulario

1. Usuario crea formulario en estado DRAFT
2. Usuario edita y completa el formulario
3. Usuario envía para revisión → PENDING_REVIEW
4. Director recibe notificación
5. Director revisa y aprueba → APPROVED
6. Se genera PDF automáticamente
7. Usuario recibe notificación de aprobación

#### Flujo 2: Rechazo y Corrección

1. Formulario en PENDING_REVIEW
2. Director rechaza con razón → REJECTED
3. Usuario recibe notificación con razón
4. Usuario edita el formulario → vuelve a DRAFT
5. Usuario vuelve a enviar para revisión
6. Proceso se repite

#### Flujo 3: Edición por Director

1. Director edita formulario de otro usuario
2. Se crea nueva versión automáticamente
3. Usuario recibe notificación de edición
4. Usuario puede ver historial de cambios
5. Usuario puede ver todas las versiones

---

## 🔍 Búsqueda Rápida

### Por Rol:

**Director**:

- [Permisos de Director](GUIA_CREACION_FORMULARIOS_POR_ROL.md#director-nivel-4)
- [Aprobar Formularios](GUIA_CREACION_FORMULARIOS_POR_ROL.md#aprobar-formulario-director)
- [Rechazar Formularios](GUIA_CREACION_FORMULARIOS_POR_ROL.md#rechazar-formulario-director)

**Coordinador 1**:

- [Permisos Coordinador 1](GUIA_CREACION_FORMULARIOS_POR_ROL.md#coordinador-1-nivel-3)
- [Formularios Permitidos](GUIA_CREACION_FORMULARIOS_POR_ROL.md#matriz-de-permisos-por-rol)

**Coordinador 2**:

- [Permisos Coordinador 2](GUIA_CREACION_FORMULARIOS_POR_ROL.md#coordinador-2-nivel-3)
- [Seguimiento Familia](GUIA_CREACION_FORMULARIOS_POR_ROL.md#7-seguimiento_familia-seguimiento-familia)

**Terapeuta**:

- [Permisos Terapeuta](GUIA_CREACION_FORMULARIOS_POR_ROL.md#terapeuta-nivel-2)
- [Plan de Trabajo](GUIA_CREACION_FORMULARIOS_POR_ROL.md#2-plan_trabajo-plan-de-trabajo-terapéutico)
- [Informe Semestral](GUIA_CREACION_FORMULARIOS_POR_ROL.md#3-informe_semestral-informe-semestral-de-progreso)

**Acompañante Externo**:

- [Permisos Acompañante](GUIA_CREACION_FORMULARIOS_POR_ROL.md#acompañante-externo-nivel-1)
- [Reporte Mensual](GUIA_CREACION_FORMULARIOS_POR_ROL.md#5-reporte_mensual-reporte-mensual)

### Por Funcionalidad:

**Autenticación**:

- [Sistema de Auth](RESUMEN_FUNCIONALIDADES.md#1-sistema-de-autenticación-y-autorización-)
- [Guards](authorization-guide.md#guards)
- [Decoradores](authorization-guide.md#decoradores)

**Formularios**:

- [Sistema Base](RESUMEN_FUNCIONALIDADES.md#3-sistema-base-de-formularios-v2-)
- [ACTAS](GUIA_CREACION_FORMULARIOS_POR_ROL.md#1-actas-actas-de-reunión)
- [Crear Formulario](GUIA_CREACION_FORMULARIOS_POR_ROL.md#crear-formulario-general)

**Workflow**:

- [Sistema de Workflow](RESUMEN_FUNCIONALIDADES.md#4-sistema-de-workflow-de-formularios-)
- [Enviar para Revisión](GUIA_CREACION_FORMULARIOS_POR_ROL.md#enviar-para-revisión)
- [Estados](RESUMEN_FUNCIONALIDADES.md#estados-de-formulario)

**Notificaciones**:

- [Sistema de Notificaciones](RESUMEN_FUNCIONALIDADES.md#5-sistema-de-notificaciones-)
- [Tipos de Notificaciones](RESUMEN_FUNCIONALIDADES.md#tipos-de-notificaciones)
- [Endpoints](GUIA_CREACION_FORMULARIOS_POR_ROL.md#notificaciones)

---

## 🆘 Soporte y Contacto

### Documentación Adicional:

- **API Docs (Swagger)**: `http://localhost:5001/api/docs`
- **GitHub Issues**: [Tu repositorio aquí]
- **Wiki del Proyecto**: [Tu wiki aquí]

### Contactos:

- **Equipo de Desarrollo**: [Email/Slack aquí]
- **Soporte Técnico**: [Email aquí]
- **Product Owner**: [Contacto aquí]

---

## 📅 Historial de Actualizaciones

| Versión | Fecha      | Cambios                        |
| ------- | ---------- | ------------------------------ |
| 1.0     | Enero 2025 | Documentación inicial completa |
|         |            | - Resumen de funcionalidades   |
|         |            | - Guía de formularios por rol  |
|         |            | - Resumen ejecutivo            |
|         |            | - Índice de documentación      |

---

## 🎯 Próximos Documentos Planeados

1. **Guía de Arquitectura** (Prioridad: Alta)
2. **Guía de Base de Datos** (Prioridad: Alta)
3. **Convenciones de Código** (Prioridad: Media)
4. **Guía de Testing** (Prioridad: Media)
5. **Guía de Deployment** (Prioridad: Media)
6. **Troubleshooting Guide** (Prioridad: Baja)

---

## 📊 Estado de la Documentación

- ✅ **Completada**: 5 documentos principales
- 🚧 **En progreso**: Swagger API (generado automáticamente)
- 🔴 **Pendiente**: 6 documentos adicionales

**Cobertura estimada**: ~70% de la documentación necesaria está completa

---

**Última actualización**: Enero 2025  
**Mantenido por**: Equipo de Desarrollo Andamiaje
