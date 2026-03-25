# Implementación de Rate Limiting

## 🔒 **Resumen de la Implementación**

Se ha implementado un sistema robusto de Rate Limiting para proteger los endpoints críticos de la API, especialmente los relacionados con autenticación y operaciones sensibles.

## 🛠️ **Componentes Implementados**

### 1. **RateLimitGuard** (`src/modules/auth/guards/rate-limit.guard.ts`)

Guard principal que implementa la lógica de rate limiting:

#### **Características:**
- ✅ Almacenamiento en memoria (optimizable a Redis en producción)
- ✅ Limpieza automática de registros expirados
- ✅ Generación de claves personalizables por IP + endpoint
- ✅ Bloqueos temporales configurables
- ✅ Mensajes de error personalizables

#### **Configuración:**
```typescript
interface RateLimitOptions {
  windowMs: number;        // Ventana de tiempo en milisegundos
  maxRequests: number;     // Máximo número de requests por ventana
  message?: string;        // Mensaje personalizado de error
  keyGenerator?: Function; // Función para generar clave única
  skipSuccessfulRequests?: boolean; // Contar solo requests fallidos
}
```

### 2. **RateLimitService** (`src/modules/auth/services/rate-limit.service.ts`)

Servicio auxiliar para gestión avanzada de rate limiting:

#### **Funcionalidades:**
- ✅ Verificación de límites con estadísticas detalladas
- ✅ Reset manual de límites
- ✅ Obtención de estadísticas en tiempo real
- ✅ Limpieza automática de registros expirados

### 3. **Decoradores Predefinidos**

#### **@AuthRateLimit()**
- **Ventana:** 15 minutos
- **Límite:** 5 intentos
- **Uso:** Endpoints de autenticación (login, refresh)
- **Bloqueo:** 15 minutos tras exceder límite

#### **@StrictRateLimit()**
- **Ventana:** 5 minutos
- **Límite:** 3 intentos
- **Uso:** Endpoints críticos (registro)
- **Bloqueo:** 5 minutos tras exceder límite

#### **@GeneralRateLimit()**
- **Ventana:** 1 minuto
- **Límite:** 100 requests
- **Uso:** Endpoints generales (upload, etc.)

## 🎯 **Endpoints Protegidos**

### **Autenticación**
- `POST /api/v1/auth/login` - **@AuthRateLimit()** (5 intentos/15min)
- `POST /api/v1/auth/register` - **@StrictRateLimit()** (3 intentos/5min)
- `POST /api/v1/auth/refresh` - **@AuthRateLimit()** (5 intentos/15min)

### **Storage**
- `POST /api/v1/storage/upload` - **@GeneralRateLimit()** (100 requests/min)

## 📊 **Configuraciones Aplicadas**

| Endpoint | Ventana | Límite | Bloqueo | Uso |
|----------|---------|--------|---------|-----|
| Login | 15 min | 5 intentos | 15 min | Autenticación |
| Register | 5 min | 3 intentos | 5 min | Registro |
| Refresh | 15 min | 5 intentos | 15 min | Renovación tokens |
| Upload | 1 min | 100 requests | 1 min | Subida archivos |

## 🔧 **Implementación en Controladores**

### **AuthController**
```typescript
@Public()
@Post("login")
@UseGuards(RateLimitGuard)
@AuthRateLimit()
async login(@Body() loginDto: LoginDto) {
  // Lógica de login
}
```

### **StorageController**
```typescript
@Post("upload")
@UseGuards(RateLimitGuard)
@GeneralRateLimit()
async upload(@UploadedFile() file: Express.Multer.File) {
  // Lógica de upload
}
```

## 🧪 **Testing**

### **Script de Pruebas**
```bash
# Ejecutar tests de rate limiting
node scripts/test-rate-limiting.js http://localhost:5001
```

### **Tests Incluidos:**
1. **Test de Login Rate Limiting**
   - Envía 6 requests rápidos
   - Verifica que el 6to sea bloqueado (429)

2. **Test de Register Rate Limiting**
   - Envía 4 requests rápidos
   - Verifica que el 4to sea bloqueado (429)

3. **Test de Endpoints Sin Límites**
   - Verifica que health check no sea afectado
   - Confirma que endpoints públicos funcionen

## 🚀 **Beneficios de Seguridad**

### **1. Protección contra Ataques**
- ✅ **Brute Force:** Limita intentos de login
- ✅ **DDoS:** Controla requests por IP
- ✅ **Spam:** Previene registro masivo
- ✅ **Abuse:** Limita uso excesivo de recursos

### **2. Configuración Flexible**
- ✅ **Por endpoint:** Diferentes límites según criticidad
- ✅ **Por IP:** Identificación única por cliente
- ✅ **Temporal:** Ventanas de tiempo configurables
- ✅ **Personalizable:** Mensajes y comportamientos custom

### **3. Monitoreo y Debugging**
- ✅ **Estadísticas:** Métricas en tiempo real
- ✅ **Logging:** Registro de bloqueos
- ✅ **Reset manual:** Limpieza de límites para testing
- ✅ **Health checks:** Verificación de funcionamiento

## 📈 **Métricas y Monitoreo**

### **Estadísticas Disponibles:**
```typescript
// Obtener estadísticas del rate limiting
const stats = rateLimitGuard.getStats();
console.log(stats);
```

### **Logs de Seguridad:**
```
[WARN] Rate limit exceeded for key: auth:192.168.1.1. Blocked until: 2024-01-01T12:30:00.000Z
[DEBUG] Cleaned up 5 expired rate limit records
```

## 🔮 **Próximas Mejoras**

### **1. Integración con Redis** (Producción)
```typescript
// Reemplazar Map por Redis para escalabilidad
private readonly redis = new Redis(process.env.REDIS_URL);
```

### **2. Rate Limiting Dinámico**
```typescript
// Ajustar límites según carga del sistema
const dynamicLimit = await this.getSystemLoad() > 80 ? 50 : 100;
```

### **3. Whitelist de IPs**
```typescript
// Permitir IPs confiables sin límites
if (this.isWhitelistedIp(ip)) return true;
```

### **4. Rate Limiting por Usuario**
```typescript
// Límites específicos por usuario autenticado
keyGenerator: (context) => `user:${context.switchToHttp().getRequest().user.id}`
```

## 🛡️ **Recomendaciones de Producción**

1. **Redis para Storage**
   - Usar Redis en lugar de Map para producción
   - Configurar TTL automático para keys

2. **Monitoreo Avanzado**
   - Integrar con sistemas de alertas
   - Dashboard de métricas en tiempo real

3. **Configuración por Entorno**
   - Límites más estrictos en producción
   - Configuración flexible para testing

4. **Logging Estructurado**
   - Logs de seguridad centralizados
   - Alertas automáticas por bloqueos

## 📋 **Checklist de Implementación**

- [x] RateLimitGuard implementado
- [x] RateLimitService creado
- [x] Decoradores predefinidos
- [x] AuthController protegido
- [x] StorageController protegido
- [x] AuthModule actualizado
- [x] Documentación completa
- [x] Scripts de testing
- [x] Sin errores de linting
- [x] Configuración flexible

## 🎯 **Resultado Final**

El sistema de Rate Limiting está completamente implementado y funcionando, proporcionando:

- **Protección robusta** contra ataques de fuerza bruta
- **Configuración flexible** para diferentes tipos de endpoints
- **Monitoreo completo** con estadísticas y logs
- **Testing automatizado** para verificar funcionamiento
- **Escalabilidad** preparada para producción con Redis

La implementación sigue las mejores prácticas de seguridad y está lista para producción.
