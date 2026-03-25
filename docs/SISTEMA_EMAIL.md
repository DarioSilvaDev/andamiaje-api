# 📧 Sistema de Notificaciones por Email

## Índice

1. [Descripción General](#descripción-general)
2. [Configuración](#configuración)
3. [Templates Disponibles](#templates-disponibles)
4. [Integración con Workflow](#integración-con-workflow)
5. [Uso del Servicio](#uso-del-servicio)
6. [Personalización](#personalización)
7. [Troubleshooting](#troubleshooting)

---

## Descripción General

El sistema de notificaciones por email de Andamiaje API envía automáticamente emails HTML profesionales para mantener a los usuarios informados sobre las acciones en el sistema.

### Características:

- ✅ **Templates HTML Responsive**: Diseños profesionales que se ven bien en todos los dispositivos
- ✅ **Integración Automática**: Se envían automáticamente en cada acción del workflow
- ✅ **Configurable**: Puede habilitarse/deshabilitarse según el entorno
- ✅ **Múltiples Proveedores**: Soporta Gmail, Outlook, SMTP personalizado
- ✅ **Logging Detallado**: Registro completo de todos los emails enviados
- ✅ **Manejo de Errores**: No interrumpe el flujo si falla el envío

---

## Configuración

### 1. Variables de Entorno

Agrega estas variables en tu archivo `.env`:

```bash
# ====================================
# EMAIL - NOTIFICACIONES
# ====================================

# Servicio de email (gmail, outlook, sendgrid, smtp)
MAIL_SERVICE=gmail

# Para Gmail/Outlook
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Para SMTP personalizado (si no usas gmail/outlook)
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false

# Configuración general
MAIL_FROM_NAME=Andamiaje API
MAIL_FROM_ADDRESS=noreply@andamiaje.com

# URL del frontend para enlaces en emails
FRONTEND_URL=http://localhost:3000

# Habilitar/deshabilitar envío de emails
MAIL_ENABLED=true
```

### 2. Configuración de Gmail

Si usas Gmail, necesitas generar una **App Password**:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (debes habilitarla)
3. Seguridad → Contraseñas de aplicaciones
4. Genera una contraseña para "Correo"
5. Usa esa contraseña en `MAIL_PASSWORD`

**Importante**: NO uses tu contraseña real de Gmail.

### 3. Configuración de Outlook

```bash
MAIL_SERVICE=outlook
MAIL_USER=your-email@outlook.com
MAIL_PASSWORD=your-password
```

### 4. SMTP Personalizado

```bash
MAIL_SERVICE=
MAIL_HOST=smtp.yourdomain.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=no-reply@yourdomain.com
MAIL_PASSWORD=your-smtp-password
```

### 5. Deshabilitar Emails (Desarrollo)

```bash
MAIL_ENABLED=false
```

Útil para desarrollo local sin configurar un servidor de email.

---

## Templates Disponibles

El sistema incluye 6 templates HTML profesionales:

### 1. **form-submitted.hbs** - Formulario Enviado para Revisión

**Cuándo se envía**: Cuando un usuario envía un formulario para revisión

**Destinatario**: Director(es)

**Contenido**:
- Nombre del usuario que envió el formulario
- Tipo y título del formulario
- Fecha de envío
- Botón para ver el formulario

**Vista previa**:
```
📋 Nuevo formulario para revisar: Acta de Reunión

Hola Director,

Juan Pérez ha enviado un nuevo formulario para tu revisión.

┌──────────────────────────────────┐
│ Tipo: Acta de Reunión            │
│ Título: Reunión mensual enero    │
│ ID: abc-123                      │
│ Fecha: 15/01/2025 10:30 AM      │
└──────────────────────────────────┘

[Ver Formulario]
```

---

### 2. **form-approved.hbs** - Formulario Aprobado

**Cuándo se envía**: Cuando un director aprueba un formulario

**Destinatario**: Creador del formulario

**Contenido**:
- Nombre del director que aprobó
- Tipo y título del formulario
- Fecha de aprobación
- Botón para ver formulario
- Botón para descargar PDF (si está disponible)

**Vista previa**:
```
✅ Formulario aprobado: Acta de Reunión

🎉 ¡Tenemos excelentes noticias!

Hola Juan,

María García ha aprobado tu formulario.

┌──────────────────────────────────┐
│ Tipo: Acta de Reunión            │
│ Título: Reunión mensual enero    │
│ Aprobado: 15/01/2025 11:00 AM   │
└──────────────────────────────────┘

El PDF se ha generado automáticamente.

[Ver Formulario] [Descargar PDF]
```

---

### 3. **form-rejected.hbs** - Formulario Rechazado

**Cuándo se envía**: Cuando un director rechaza un formulario

**Destinatario**: Creador del formulario

**Contenido**:
- Nombre del director que rechazó
- Tipo y título del formulario
- Motivo del rechazo
- Botón para editar formulario

**Vista previa**:
```
❌ Formulario Rechazado

Hola Juan,

María García ha rechazado tu formulario y requiere correcciones.

┌──────────────────────────────────┐
│ Tipo: Acta de Reunión            │
│ Título: Reunión mensual enero    │
│ Rechazado: 15/01/2025 11:00 AM  │
└──────────────────────────────────┘

📝 Motivo del rechazo:
"Faltan firmas de los asistentes y 
el acta debe incluir más detalles
sobre los acuerdos tomados."

[Editar Formulario]
```

---

### 4. **form-edited.hbs** - Formulario Editado

**Cuándo se envía**: Cuando un director edita el formulario de otro usuario

**Destinatario**: Creador del formulario

**Contenido**:
- Nombre del director que editó
- Tipo y título del formulario
- Cambios realizados (opcional)
- Botón para ver formulario

---

### 5. **welcome.hbs** - Bienvenida

**Cuándo se envía**: Cuando se crea una nueva cuenta de usuario

**Destinatario**: Usuario recién creado

**Contenido**:
- Saludo personalizado
- Detalles de la cuenta (usuario, rol)
- Lista de funcionalidades disponibles
- Botón para iniciar sesión

---

### 6. **password-changed.hbs** - Contraseña Cambiada

**Cuándo se envía**: Cuando un usuario cambia su contraseña

**Destinatario**: Usuario que cambió la contraseña

**Contenido**:
- Confirmación del cambio
- Fecha y hora del cambio
- Alerta de seguridad
- Botón de soporte

---

## Integración con Workflow

El sistema de email está completamente integrado con el workflow de formularios:

### Flujo Completo:

```
1. Usuario crea formulario (DRAFT)
   └─> No se envía email

2. Usuario envía para revisión (PENDING_REVIEW)
   └─> ✉️ Email a Director(es): "form-submitted"

3a. Director APRUEBA (APPROVED)
    └─> ✉️ Email al Creador: "form-approved" (con PDF)

3b. Director RECHAZA (REJECTED)
    └─> ✉️ Email al Creador: "form-rejected" (con motivo)

4. Director edita formulario de otro usuario
   └─> ✉️ Email al Creador: "form-edited"
```

### Código de Integración:

El email se envía automáticamente en `WorkflowService`:

```typescript
// Ejemplo: Aprobar formulario
async approveForm(formId: string, director: User): Promise<BaseForm> {
  // ... lógica de aprobación ...
  
  // Notificación automática con email
  await this.notifyOwner(form, director, NotificationType.FORM_APPROVED);
  
  return savedForm;
}

// En notifyOwner:
private async notifyOwner(...) {
  // Crear notificación en BD
  await this.notificationRepository.save(notification);
  
  // Enviar email automáticamente
  await this.emailService.sendFormApprovedEmail(
    form.createdBy,
    form,
    sender
  );
}
```

---

## Uso del Servicio

### Inyección del Servicio

```typescript
import { EmailService } from '@/modules/email/email.service';

@Injectable()
export class MiServicio {
  constructor(
    private readonly emailService: EmailService
  ) {}
}
```

### Métodos Disponibles

#### 1. Enviar Email de Formulario Enviado

```typescript
await this.emailService.sendFormSubmittedEmail(
  director,     // Usuario destinatario
  formulario,   // BaseForm
  creador       // Usuario que envió
);
```

#### 2. Enviar Email de Formulario Aprobado

```typescript
await this.emailService.sendFormApprovedEmail(
  creador,      // Usuario destinatario
  formulario,   // BaseForm
  director      // Usuario que aprobó
);
```

#### 3. Enviar Email de Formulario Rechazado

```typescript
await this.emailService.sendFormRejectedEmail(
  creador,      // Usuario destinatario
  formulario,   // BaseForm
  director,     // Usuario que rechazó
  'Motivo...'   // Razón del rechazo
);
```

#### 4. Enviar Email de Formulario Editado

```typescript
await this.emailService.sendFormEditedEmail(
  creador,      // Usuario destinatario
  formulario,   // BaseForm
  director,     // Usuario que editó
  'Cambios...'  // Descripción de cambios (opcional)
);
```

#### 5. Enviar Email de Bienvenida

```typescript
await this.emailService.sendWelcomeEmail(usuario);
```

#### 6. Enviar Email de Contraseña Cambiada

```typescript
await this.emailService.sendPasswordChangedEmail(usuario);
```

#### 7. Enviar Email Personalizado

```typescript
await this.emailService.sendCustomEmail(
  'user@example.com',
  'Asunto del email',
  'nombre-template',  // Sin extensión .hbs
  { variable1: 'valor1', variable2: 'valor2' }
);
```

---

## Personalización

### Crear un Nuevo Template

1. **Crear archivo de template**:
   
   Crea `src/modules/email/templates/mi-template.hbs`:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        /* Estilos inline para compatibilidad */
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hola {{nombre}}</h1>
        <p>{{mensaje}}</p>
    </div>
</body>
</html>
```

2. **Usar el template**:

```typescript
await this.emailService.sendCustomEmail(
  'user@example.com',
  'Mi Asunto',
  'mi-template',
  { nombre: 'Juan', mensaje: 'Este es mi email' }
);
```

### Modificar Templates Existentes

Todos los templates están en: `src/modules/email/templates/`

Puedes editarlos directamente. Usan **Handlebars** como motor de templates.

**Sintaxis de Handlebars**:

```handlebars
{{variable}}              <!-- Variable simple -->
{{#if variable}}...{{/if}}  <!-- Condicional -->
{{#each lista}}...{{/each}} <!-- Bucle -->
```

---

## Troubleshooting

### ❌ Error: "Invalid login credentials"

**Causa**: Contraseña incorrecta o Gmail bloqueando el acceso.

**Solución**:
1. Verifica que `MAIL_USER` y `MAIL_PASSWORD` sean correctos
2. Para Gmail, usa una **App Password**, no tu contraseña real
3. Verifica que la verificación en dos pasos esté habilitada

---

### ❌ Error: "getaddrinfo ENOTFOUND smtp.gmail.com"

**Causa**: No hay conexión a internet o DNS no resuelve.

**Solución**:
1. Verifica tu conexión a internet
2. Verifica que `MAIL_HOST` sea correcto
3. Prueba hacer ping al servidor SMTP

---

### ❌ Los emails no se envían pero no hay error

**Causa**: `MAIL_ENABLED=false` o el servicio falla silenciosamente.

**Solución**:
1. Verifica que `MAIL_ENABLED=true` en `.env`
2. Revisa los logs de la aplicación:
   ```bash
   tail -f logs/combined.log
   ```
3. Busca mensajes como:
   - ✅ "Email enviado a user@example.com"
   - ❌ "Error enviando email"

---

### ❌ Los emails llegan a spam

**Causa**: Configuración de dominio o contenido sospechoso.

**Solución**:
1. **Producción**: Configura SPF, DKIM y DMARC en tu dominio
2. **Desarrollo**: Usa servicios como Mailtrap o MailHog para testing
3. Evita palabras spam en asuntos/contenido
4. Usa un dominio verificado

---

### ❌ Template no encontrado

**Error**: `Error: template not found`

**Solución**:
1. Verifica que el archivo exista: `src/modules/email/templates/nombre.hbs`
2. Verifica que uses el nombre correcto (sin `.hbs`)
3. Reconstruye el proyecto: `npm run build`

---

### 🔍 Testing en Desarrollo

Para testing sin enviar emails reales:

**Opción 1: Deshabilitar emails**

```bash
MAIL_ENABLED=false
```

**Opción 2: Usar Mailtrap**

1. Crea cuenta en https://mailtrap.io (gratis)
2. Obtén credenciales SMTP
3. Configura:

```bash
MAIL_SERVICE=
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENABLED=true
```

Todos los emails llegarán a Mailtrap donde puedes verlos.

**Opción 3: Usar MailHog (local)**

```bash
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# En .env:
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_ENABLED=true
```

Ve los emails en: http://localhost:8025

---

## Estadísticas y Logs

### Ver Emails Enviados

Los logs de email están en: `logs/combined.log`

```bash
# Ver todos los emails enviados
grep "Email enviado" logs/combined.log

# Ver errores de email
grep "Error enviando email" logs/combined.log

# Ver emails de hoy
grep "Email enviado" logs/combined-$(date +%Y-%m-%d).log
```

### Formato de Log

```
2025-01-15 10:30:45 [EmailService] LOG Email enviado a juan@example.com: Formulario abc-123 enviado para revisión
2025-01-15 11:00:12 [EmailService] LOG Email enviado a juan@example.com: Formulario abc-123 aprobado
```

---

## Próximas Mejoras (Opcional)

Posibles mejoras futuras para el sistema de email:

- 📊 **Dashboard de emails**: Panel para ver estadísticas de envíos
- 📅 **Resúmenes diarios**: Email diario con resumen de formularios pendientes
- 🔔 **Recordatorios**: Emails automáticos para formularios pendientes por X días
- 🎨 **Editor visual**: Editor WYSIWYG para templates
- 📎 **Adjuntos**: Adjuntar PDFs directamente al email de aprobación
- 🌐 **Multi-idioma**: Templates en varios idiomas
- 📧 **Preferencias**: Permitir a usuarios elegir qué emails recibir

---

## Resumen

✅ **6 templates profesionales**  
✅ **Integración automática con workflow**  
✅ **Múltiples proveedores de email**  
✅ **Configurable y escalable**  
✅ **Logging completo**  
✅ **Manejo robusto de errores**

El sistema de email está **listo para producción** y mejorará significativamente la experiencia de usuario al mantenerlos informados en tiempo real.

---

**Documentación actualizada**: Enero 2025  
**Versión del sistema**: 2.0

