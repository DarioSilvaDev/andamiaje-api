# Guía de Creación de Formularios por Rol

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Matriz de Permisos por Rol](#matriz-de-permisos-por-rol)
3. [Estructura General de Formularios](#estructura-general-de-formularios)
4. [Formularios por Tipo](#formularios-por-tipo)
5. [Ejemplos de Peticiones API](#ejemplos-de-peticiones-api)
6. [Validaciones y Reglas de Negocio](#validaciones-y-reglas-de-negocio)

---

## 🎯 Visión General

Todos los formularios en Andamiaje API siguen una arquitectura unificada basada en `BaseForm`. Cada rol tiene permisos específicos para crear diferentes tipos de formularios.

### Estados de un Formulario:

- **DRAFT**: Borrador, en edición
- **PENDING_REVIEW**: Enviado para revisión del director
- **APPROVED**: Aprobado por el director
- **REJECTED**: Rechazado por el director
- **ARCHIVED**: Archivado

### Workflow Estándar:

```
DRAFT → PENDING_REVIEW → APPROVED
            ↓
        REJECTED → (volver a DRAFT para editar)
```

---

## 🔐 Matriz de Permisos por Rol

| Tipo de Formulario          | Director | Coord. 1 | Coord. 2 | Terapeuta | Acomp. Ext. |
| --------------------------- | -------- | -------- | -------- | --------- | ----------- |
| **PLAN_TRABAJO**            | ✅       | ✅       | ❌       | ✅        | ✅          |
| **INFORME_SEMESTRAL**       | ✅       | ✅       | ✅       | ✅        | ❌          |
| **INFORME_ADMISION**        | ✅       | ✅       | ❌       | ✅        | ❌          |
| **ACTAS**                   | ✅       | ✅       | ✅       | ✅        | ❌          |
| **REPORTE_MENSUAL**         | ✅       | ✅       | ❌       | ❌        | ✅          |
| **SEGUIMIENTO_ACOMPANANTE** | ✅       | ✅       | ❌       | ❌        | ❌          |
| **SEGUIMIENTO_FAMILIA**     | ✅       | ❌       | ✅       | ❌        | ❌          |
| **FACTURA**                 | ✅       | ✅       | ✅       | ✅        | ✅          |

---

## 📝 Estructura General de Formularios

### Campos Comunes (BaseForm)

Todos los formularios heredan estos campos:

```typescript
{
  // Campos obligatorios base
  "type": "FORMTYPE",           // Tipo de formulario (enum)
  "title": "string",            // Título del formulario

  // Datos del paciente (opcionales pero recomendados)
  "patientName": "string",      // Nombre completo del paciente
  "patientDocumentNumber": "string", // DNI o documento
  "patientAge": number,         // Edad del paciente
  "patientBirthDate": "YYYY-MM-DD", // Fecha de nacimiento
  "patientDiagnosis": "string", // Diagnóstico

  // Campos adicionales
  "notes": "string",            // Notas adicionales (opcional)

  // Campos autogenerados (no enviar)
  "id": "uuid",                 // Generado por el sistema
  "status": "DocumentStatus",   // Automático: DRAFT
  "version": number,            // Automático: 1
  "createdBy": User,           // Usuario autenticado
  "createdAt": "timestamp",    // Fecha de creación
  "updatedAt": "timestamp"     // Última actualización
}
```

---

## 📋 Formularios por Tipo

### 1. ACTAS (Actas de Reunión)

**Roles permitidos**: Director, Coordinador 1, Coordinador 2, Terapeuta

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "ACTAS",
  "title": "string",

  // Información de la reunión
  "modality": "VIRTUAL" | "PRESENCIAL",  // OBLIGATORIO
  "subject": "string",                    // OBLIGATORIO - Asunto
  "agenda": "string",                     // OBLIGATORIO - Agenda
  "meetingDate": "YYYY-MM-DDTHH:mm:ss",  // OBLIGATORIO - Fecha y hora
  "durationMinutes": number,              // Duración (default: 60)

  // Ubicación
  "location": "string",                   // OBLIGATORIO si presencial
  "meetingUrl": "string",                 // OBLIGATORIO si virtual

  // Asistentes
  "attendees": [                          // OBLIGATORIO - Al menos 1
    {
      "id": "string",                     // ID del usuario
      "name": "string",                   // Nombre completo
      "role": "string",                   // Rol del asistente
      "attended": boolean,                // Asistió o no
      "signature": "string"               // Firma digital (opcional)
    }
  ],

  // Contenido
  "decisions": "string",                  // OBLIGATORIO - Decisiones tomadas
  "agreements": "string",                 // Acuerdos alcanzados (opcional)
  "nextSteps": "string",                  // Próximos pasos (opcional)
  "nextMeetingDate": "YYYY-MM-DD",       // Fecha próxima reunión (opcional)
  "additionalNotes": "string",           // Notas adicionales (opcional)

  // Datos del paciente (opcional)
  "patientName": "string",
  "patientDocumentNumber": "string",
  "patientAge": number,
  "patientBirthDate": "YYYY-MM-DD",
  "patientDiagnosis": "string"
}
```

#### Validaciones:

- ✅ `subject`, `agenda`, `meetingDate`, `decisions` son obligatorios
- ✅ `meetingDate` no puede ser fecha futura
- ✅ `attendees` debe tener al menos 1 elemento
- ✅ Si `modality` es VIRTUAL, `meetingUrl` es obligatoria
- ✅ Si `modality` es PRESENCIAL, `location` es obligatoria
- ✅ `durationMinutes` debe estar entre 1 y 480 (8 horas)

#### Ejemplo de Petición:

```json
POST /api/v1/forms

{
  "type": "ACTAS",
  "baseData": {
    "title": "Acta - Reunión de Seguimiento - 15/01/2025",
    "patientName": "Juan Pérez García",
    "patientDocumentNumber": "12345678A",
    "patientAge": 35,
    "patientBirthDate": "1989-03-15",
    "patientDiagnosis": "Trastorno del lenguaje expresivo"
  },
  "specificData": {
    "modality": "VIRTUAL",
    "subject": "Reunión de seguimiento trimestral",
    "agenda": "1. Revisión de objetivos\n2. Evaluación de progreso\n3. Ajustes al plan de trabajo\n4. Próximos pasos",
    "meetingDate": "2025-01-15T10:00:00",
    "durationMinutes": 90,
    "meetingUrl": "https://zoom.us/j/123456789",
    "attendees": [
      {
        "id": "user-123",
        "name": "Ana López Martínez",
        "role": "TERAPEUTA",
        "attended": true,
        "signature": "base64_encoded_signature"
      },
      {
        "id": "user-456",
        "name": "Carlos Ruiz Sánchez",
        "role": "COORDINADOR_UNO",
        "attended": true
      },
      {
        "id": "user-789",
        "name": "María García Fernández",
        "role": "DIRECTOR",
        "attended": true
      }
    ],
    "decisions": "1. Continuar con el plan actual durante 3 meses más\n2. Aumentar frecuencia de sesiones a 2 por semana\n3. Incluir ejercicios de expresión oral en casa",
    "agreements": "Todos los participantes están de acuerdo en implementar los cambios propuestos",
    "nextSteps": "1. Terapeuta elaborará plan de ejercicios\n2. Coordinador actualizará cronograma\n3. Director revisará en 15 días",
    "nextMeetingDate": "2025-04-15",
    "additionalNotes": "Se observa mejora significativa en la motivación del paciente"
  }
}
```

---

### 2. PLAN_TRABAJO (Plan de Trabajo Terapéutico)

**Roles permitidos**: Director, Coordinador 1, Terapeuta, Acompañante Externo

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "PLAN_TRABAJO",
  "title": "string",

  // Información general
  "startDate": "YYYY-MM-DD",              // OBLIGATORIO - Fecha inicio
  "endDate": "YYYY-MM-DD",                // OBLIGATORIO - Fecha fin
  "duration": number,                     // Duración en meses
  "modality": "VIRTUAL" | "PRESENCIAL" | "MIXTA",

  // Objetivos terapéuticos
  "generalObjectives": [                  // OBLIGATORIO - Al menos 1
    {
      "id": "string",
      "description": "string",            // Descripción del objetivo
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "indicators": "string",             // Indicadores de logro
      "status": "PENDING" | "IN_PROGRESS" | "ACHIEVED"
    }
  ],

  "specificObjectives": [                 // OBLIGATORIO - Al menos 2
    {
      "id": "string",
      "description": "string",
      "generalObjectiveId": "string",     // Relación con objetivo general
      "expectedOutcome": "string",
      "evaluationCriteria": "string",
      "deadline": "YYYY-MM-DD",
      "status": "PENDING" | "IN_PROGRESS" | "ACHIEVED"
    }
  ],

  // Metodología
  "methodology": {
    "approach": "string",                 // OBLIGATORIO - Enfoque terapéutico
    "techniques": ["string"],             // Técnicas a utilizar
    "materials": ["string"],              // Materiales necesarios
    "frequency": "string",                // Frecuencia de sesiones
    "sessionDuration": number             // Duración de sesiones en minutos
  },

  // Cronograma
  "schedule": [
    {
      "month": number,                    // Mes (1-12)
      "activities": ["string"],           // Actividades del mes
      "objectives": ["string"],           // Objetivos a trabajar
      "evaluation": "string"              // Forma de evaluación
    }
  ],

  // Evaluación
  "evaluationMethod": "string",           // OBLIGATORIO - Método de evaluación
  "evaluationFrequency": "string",        // Frecuencia de evaluación
  "progressIndicators": ["string"],       // Indicadores de progreso

  // Recursos
  "humanResources": [
    {
      "role": "string",
      "name": "string",
      "responsibilities": "string"
    }
  ],
  "materialResources": ["string"],
  "estimatedBudget": number,

  // Observaciones
  "observations": "string",
  "recommendations": "string",

  // Datos del paciente (OBLIGATORIOS para este tipo)
  "patientName": "string",
  "patientDocumentNumber": "string",
  "patientAge": number,
  "patientBirthDate": "YYYY-MM-DD",
  "patientDiagnosis": "string"
}
```

#### Validaciones:

- ✅ `startDate`, `endDate` son obligatorios
- ✅ `endDate` debe ser posterior a `startDate`
- ✅ Al menos 1 objetivo general y 2 objetivos específicos
- ✅ Metodología con `approach` obligatorio
- ✅ `evaluationMethod` obligatorio
- ✅ Datos del paciente obligatorios

#### Ejemplo de Petición:

```json
POST /api/v1/forms

{
  "type": "PLAN_TRABAJO",
  "baseData": {
    "title": "Plan de Trabajo - Juan Pérez - 2025",
    "patientName": "Juan Pérez García",
    "patientDocumentNumber": "12345678A",
    "patientAge": 35,
    "patientBirthDate": "1989-03-15",
    "patientDiagnosis": "Trastorno del lenguaje expresivo moderado"
  },
  "specificData": {
    "startDate": "2025-01-15",
    "endDate": "2025-06-15",
    "duration": 5,
    "modality": "PRESENCIAL",
    "generalObjectives": [
      {
        "id": "obj-gen-1",
        "description": "Mejorar la expresión oral del paciente",
        "priority": "HIGH",
        "indicators": "Aumentar vocabulario expresivo en un 50%",
        "status": "PENDING"
      }
    ],
    "specificObjectives": [
      {
        "id": "obj-esp-1",
        "description": "Incrementar vocabulario activo en 100 palabras",
        "generalObjectiveId": "obj-gen-1",
        "expectedOutcome": "Uso correcto de 100 palabras nuevas en contexto",
        "evaluationCriteria": "Test de vocabulario y observación en sesión",
        "deadline": "2025-03-15",
        "status": "PENDING"
      },
      {
        "id": "obj-esp-2",
        "description": "Mejorar construcción de frases de 5+ palabras",
        "generalObjectiveId": "obj-gen-1",
        "expectedOutcome": "Construcción correcta de frases complejas",
        "evaluationCriteria": "Análisis de producciones orales",
        "deadline": "2025-04-15",
        "status": "PENDING"
      }
    ],
    "methodology": {
      "approach": "Enfoque comunicativo funcional con apoyo visual",
      "techniques": [
        "Modelado de lenguaje",
        "Expansión de frases",
        "Uso de pictogramas",
        "Juegos de roles comunicativos"
      ],
      "materials": [
        "Tarjetas de vocabulario",
        "Pictogramas ARASAAC",
        "Material manipulativo",
        "Tablet con aplicaciones específicas"
      ],
      "frequency": "2 sesiones semanales",
      "sessionDuration": 60
    },
    "schedule": [
      {
        "month": 1,
        "activities": [
          "Evaluación inicial",
          "Establecimiento de vocabulario base",
          "Introducción de pictogramas"
        ],
        "objectives": ["obj-esp-1"],
        "evaluation": "Evaluación diagnóstica y línea base"
      },
      {
        "month": 2,
        "activities": [
          "Ampliación de vocabulario",
          "Práctica de construcción de frases simples"
        ],
        "objectives": ["obj-esp-1", "obj-esp-2"],
        "evaluation": "Evaluación formativa semanal"
      }
    ],
    "evaluationMethod": "Evaluación continua mediante observación directa, registro de producciones y tests estandarizados",
    "evaluationFrequency": "Semanal",
    "progressIndicators": [
      "Número de palabras nuevas utilizadas correctamente",
      "Longitud media de las frases producidas",
      "Frecuencia de uso del lenguaje espontáneo",
      "Nivel de frustración comunicativa"
    ],
    "humanResources": [
      {
        "role": "Terapeuta principal",
        "name": "Ana López Martínez",
        "responsibilities": "Sesiones terapéuticas y seguimiento"
      },
      {
        "role": "Coordinador",
        "name": "Carlos Ruiz Sánchez",
        "responsibilities": "Supervisión y coordinación con familia"
      }
    ],
    "materialResources": [
      "Material impreso",
      "Material digital",
      "Juegos educativos",
      "Software específico"
    ],
    "estimatedBudget": 500,
    "observations": "El paciente muestra buena disposición y motivación para el trabajo terapéutico",
    "recommendations": "Se recomienda trabajo complementario en casa con apoyo familiar"
  }
}
```

---

### 3. INFORME_SEMESTRAL (Informe Semestral de Progreso)

**Roles permitidos**: Director, Coordinador 1, Coordinador 2, Terapeuta

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "INFORME_SEMESTRAL",
  "title": "string",

  // Información del periodo
  "periodStart": "YYYY-MM-DD",            // OBLIGATORIO - Inicio periodo
  "periodEnd": "YYYY-MM-DD",              // OBLIGATORIO - Fin periodo
  "semester": 1 | 2,                      // Semestre del año
  "year": number,                         // Año

  // Resumen ejecutivo
  "executiveSummary": "string",           // OBLIGATORIO - Resumen general

  // Evaluación de objetivos
  "objectivesEvaluation": [               // OBLIGATORIO
    {
      "objectiveId": "string",            // ID del objetivo del plan
      "description": "string",
      "initialStatus": "string",          // Estado al inicio
      "currentStatus": "ACHIEVED" | "IN_PROGRESS" | "NOT_ACHIEVED",
      "progressPercentage": number,       // 0-100
      "evidence": "string",               // Evidencia del progreso
      "observations": "string"
    }
  ],

  // Áreas evaluadas
  "areasEvaluation": {
    "communication": {
      "score": number,                    // 1-10
      "description": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendations": ["string"]
    },
    "cognition": {
      "score": number,
      "description": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendations": ["string"]
    },
    "socialSkills": {
      "score": number,
      "description": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendations": ["string"]
    },
    "autonomy": {
      "score": number,
      "description": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "recommendations": ["string"]
    }
  },

  // Sesiones realizadas
  "sessionsInfo": {
    "planned": number,                    // Sesiones planificadas
    "completed": number,                  // Sesiones realizadas
    "cancelled": number,                  // Sesiones canceladas
    "attendanceRate": number,             // Porcentaje de asistencia
    "cancellationReasons": ["string"]
  },

  // Metodología aplicada
  "methodologyUsed": {
    "techniques": ["string"],
    "materials": ["string"],
    "adaptations": "string"
  },

  // Participación familiar
  "familyParticipation": {
    "level": "HIGH" | "MEDIUM" | "LOW",
    "description": "string",
    "observations": "string"
  },

  // Conclusiones y recomendaciones
  "conclusions": "string",                // OBLIGATORIO
  "recommendations": "string",            // OBLIGATORIO
  "proposedAdjustments": "string",

  // Próximos pasos
  "nextSteps": "string",
  "requiresPlanAdjustment": boolean,
  "suggestedFrequency": "string",

  // Datos del paciente (OBLIGATORIOS)
  "patientName": "string",
  "patientDocumentNumber": "string",
  "patientAge": number,
  "patientBirthDate": "YYYY-MM-DD",
  "patientDiagnosis": "string"
}
```

#### Validaciones:

- ✅ `periodStart`, `periodEnd` son obligatorios
- ✅ `periodEnd` debe ser posterior a `periodStart`
- ✅ `executiveSummary`, `conclusions`, `recommendations` obligatorios
- ✅ Al menos 1 objetivo evaluado
- ✅ Todas las áreas deben tener score entre 1 y 10
- ✅ Datos del paciente obligatorios

---

### 4. INFORME_ADMISION (Informe de Admisión)

**Roles permitidos**: Director, Coordinador 1, Terapeuta

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "INFORME_ADMISION",
  "title": "string",

  // Información de admisión
  "admissionDate": "YYYY-MM-DD",          // OBLIGATORIO
  "referralSource": "string",             // OBLIGATORIO - Fuente de derivación
  "referralReason": "string",             // OBLIGATORIO - Motivo de derivación

  // Datos personales del paciente (OBLIGATORIOS)
  "patientName": "string",
  "patientDocumentNumber": "string",
  "patientAge": number,
  "patientBirthDate": "YYYY-MM-DD",
  "patientDiagnosis": "string",
  "patientAddress": "string",
  "patientPhone": "string",
  "patientEmail": "string",

  // Datos familiares
  "familyData": {
    "primaryCaregiver": {
      "name": "string",
      "relationship": "string",
      "phone": "string",
      "email": "string"
    },
    "familyComposition": ["string"],
    "familyDynamics": "string",
    "socioeconomicLevel": "HIGH" | "MEDIUM" | "LOW"
  },

  // Antecedentes
  "medicalHistory": {
    "prenatalHistory": "string",
    "perinatalHistory": "string",
    "postnatalHistory": "string",
    "developmentalMilestones": "string",
    "previousTreatments": ["string"],
    "currentMedication": ["string"],
    "allergies": ["string"]
  },

  // Evaluación inicial
  "initialEvaluation": {
    "communicationSkills": {
      "receptive": "string",
      "expressive": "string",
      "pragmatic": "string",
      "score": number
    },
    "cognitiveSkills": {
      "attention": "string",
      "memory": "string",
      "reasoning": "string",
      "score": number
    },
    "socialSkills": {
      "interaction": "string",
      "cooperation": "string",
      "empathy": "string",
      "score": number
    },
    "motorSkills": {
      "gross": "string",
      "fine": "string",
      "score": number
    }
  },

  // Instrumentos aplicados
  "assessmentTools": [
    {
      "name": "string",
      "date": "YYYY-MM-DD",
      "results": "string",
      "conclusions": "string"
    }
  ],

  // Diagnóstico
  "diagnosis": {
    "primary": "string",                  // OBLIGATORIO
    "secondary": ["string"],
    "severity": "MILD" | "MODERATE" | "SEVERE",
    "prognosis": "FAVORABLE" | "RESERVED" | "UNFAVORABLE"
  },

  // Recomendaciones
  "recommendations": {
    "interventionType": "string",         // OBLIGATORIO
    "frequency": "string",                // OBLIGATORIO
    "duration": "string",
    "additionalServices": ["string"],
    "familyGuidance": "string"
  },

  // Conclusiones
  "conclusions": "string",                // OBLIGATORIO
  "urgencyLevel": "HIGH" | "MEDIUM" | "LOW"
}
```

#### Validaciones:

- ✅ `admissionDate`, `referralSource`, `referralReason` obligatorios
- ✅ Datos completos del paciente obligatorios
- ✅ Diagnóstico primario obligatorio
- ✅ Tipo de intervención y frecuencia obligatorios
- ✅ Conclusiones obligatorias
- ✅ Al menos 1 instrumento de evaluación aplicado

---

### 5. REPORTE_MENSUAL (Reporte Mensual)

**Roles permitidos**: Director, Coordinador 1, Acompañante Externo

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "REPORTE_MENSUAL",
  "title": "string",

  // Periodo
  "month": number,                        // 1-12
  "year": number,
  "periodStart": "YYYY-MM-DD",
  "periodEnd": "YYYY-MM-DD",

  // Resumen del mes
  "monthlySummary": "string",             // OBLIGATORIO

  // Actividades realizadas
  "activities": [                         // OBLIGATORIO - Al menos 1
    {
      "date": "YYYY-MM-DD",
      "type": "string",
      "description": "string",
      "duration": number,
      "participants": ["string"],
      "observations": "string"
    }
  ],

  // Progreso observado
  "progress": {
    "achievements": ["string"],            // OBLIGATORIO
    "difficulties": ["string"],
    "emergingSkills": ["string"],
    "areasOfConcern": ["string"]
  },

  // Asistencia
  "attendance": {
    "plannedSessions": number,
    "attendedSessions": number,
    "missedSessions": number,
    "attendanceRate": number,
    "missedReasons": ["string"]
  },

  // Comportamiento
  "behavior": {
    "mood": "string",
    "motivation": "HIGH" | "MEDIUM" | "LOW",
    "cooperation": "HIGH" | "MEDIUM" | "LOW",
    "significantBehaviors": ["string"]
  },

  // Participación familiar
  "familyInvolvement": {
    "level": "HIGH" | "MEDIUM" | "LOW",
    "activities": ["string"],
    "feedback": "string"
  },

  // Observaciones específicas
  "observations": "string",
  "incidents": ["string"],
  "celebrations": ["string"],

  // Próximo mes
  "nextMonthPlanning": "string",
  "recommendations": "string",

  // Datos del paciente
  "patientName": "string",
  "patientDocumentNumber": "string"
}
```

#### Validaciones:

- ✅ `month`, `year` obligatorios
- ✅ `monthlySummary` obligatorio
- ✅ Al menos 1 actividad registrada
- ✅ Al menos 1 logro en progreso
- ✅ Información de asistencia completa

---

### 6. SEGUIMIENTO_ACOMPANANTE (Seguimiento Acompañante Externo)

**Roles permitidos**: Director, Coordinador 1

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "SEGUIMIENTO_ACOMPANANTE",
  "title": "string",

  // Información del acompañante
  "accompanistInfo": {
    "name": "string",                     // OBLIGATORIO
    "documentNumber": "string",
    "relationshipToPatient": "string",
    "contactInfo": {
      "phone": "string",
      "email": "string",
      "address": "string"
    }
  },

  // Periodo de seguimiento
  "periodStart": "YYYY-MM-DD",            // OBLIGATORIO
  "periodEnd": "YYYY-MM-DD",              // OBLIGATORIO

  // Actividades de acompañamiento
  "accompanimentActivities": [            // OBLIGATORIO - Al menos 1
    {
      "date": "YYYY-MM-DD",
      "type": "string",
      "description": "string",
      "location": "string",
      "duration": number,
      "observations": "string"
    }
  ],

  // Evaluación del acompañamiento
  "evaluation": {
    "commitment": {
      "score": number,                    // 1-10
      "description": "string"
    },
    "effectiveness": {
      "score": number,
      "description": "string"
    },
    "communication": {
      "score": number,
      "description": "string"
    },
    "relationshipWithPatient": {
      "score": number,
      "description": "string"
    }
  },

  // Observaciones
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "challenges": ["string"],
  "successStories": ["string"],

  // Coordinación
  "coordinationWithTeam": {
    "frequency": "string",
    "quality": "HIGH" | "MEDIUM" | "LOW",
    "observations": "string"
  },

  // Recomendaciones
  "recommendations": "string",            // OBLIGATORIO
  "trainingNeeds": ["string"],
  "supportRequired": "string",

  // Datos del paciente
  "patientName": "string",
  "patientDocumentNumber": "string"
}
```

#### Validaciones:

- ✅ Información del acompañante obligatoria
- ✅ Periodo de seguimiento obligatorio
- ✅ Al menos 1 actividad registrada
- ✅ Evaluaciones con scores entre 1 y 10
- ✅ Recomendaciones obligatorias

---

### 7. SEGUIMIENTO_FAMILIA (Seguimiento Familia)

**Roles permitidos**: Director, Coordinador 2

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "SEGUIMIENTO_FAMILIA",
  "title": "string",

  // Información familiar
  "familyComposition": [                  // OBLIGATORIO - Al menos 1
    {
      "name": "string",
      "relationship": "string",
      "age": number,
      "occupation": "string",
      "involvementLevel": "HIGH" | "MEDIUM" | "LOW"
    }
  ],

  // Periodo
  "periodStart": "YYYY-MM-DD",            // OBLIGATORIO
  "periodEnd": "YYYY-MM-DD",              // OBLIGATORIO

  // Contactos realizados
  "familyContacts": [                     // OBLIGATORIO - Al menos 1
    {
      "date": "YYYY-MM-DD",
      "type": "PRESENCIAL" | "TELEFÓNICO" | "VIRTUAL",
      "participants": ["string"],
      "topics": ["string"],
      "duration": number,
      "agreements": "string",
      "observations": "string"
    }
  ],

  // Dinámica familiar
  "familyDynamics": {
    "communication": {
      "quality": "HIGH" | "MEDIUM" | "LOW",
      "description": "string"
    },
    "supportNetwork": {
      "strength": "HIGH" | "MEDIUM" | "LOW",
      "description": "string"
    },
    "parentingStyle": "string",
    "conflictResolution": "string",
    "cohesion": {
      "level": "HIGH" | "MEDIUM" | "LOW",
      "description": "string"
    }
  },

  // Necesidades identificadas
  "identifiedNeeds": [
    {
      "category": "string",
      "description": "string",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "proposedIntervention": "string"
    }
  ],

  // Recursos familiares
  "familyResources": {
    "economic": "SUFFICIENT" | "LIMITED" | "INSUFFICIENT",
    "emotional": "STRONG" | "MODERATE" | "WEAK",
    "social": "EXTENSIVE" | "MODERATE" | "LIMITED",
    "educational": "HIGH" | "MEDIUM" | "LOW"
  },

  // Participación en el proceso
  "participation": {
    "sessionsAttendance": number,
    "homeActivitiesCompliance": "HIGH" | "MEDIUM" | "LOW",
    "communicationFrequency": "HIGH" | "MEDIUM" | "LOW",
    "observations": "string"
  },

  // Evaluación del periodo
  "periodEvaluation": {
    "progressAchieved": ["string"],
    "persistentChallenges": ["string"],
    "familyStrengths": ["string"],
    "areasForImprovement": ["string"]
  },

  // Recomendaciones
  "recommendations": "string",            // OBLIGATORIO
  "suggestedInterventions": ["string"],
  "referrals": ["string"],

  // Datos del paciente
  "patientName": "string",
  "patientDocumentNumber": "string"
}
```

#### Validaciones:

- ✅ Composición familiar obligatoria
- ✅ Periodo de seguimiento obligatorio
- ✅ Al menos 1 contacto familiar registrado
- ✅ Dinámica familiar evaluada
- ✅ Recomendaciones obligatorias

---

### 8. FACTURA (Factura/Comprobante)

**Roles permitidos**: Todos los roles

#### Campos Específicos:

```typescript
{
  // Campos base
  "type": "FACTURA",
  "title": "string",

  // Información de factura
  "invoiceNumber": "string",              // OBLIGATORIO - Autogenerado
  "invoiceDate": "YYYY-MM-DD",            // OBLIGATORIO
  "dueDate": "YYYY-MM-DD",

  // Datos del cliente
  "clientInfo": {
    "name": "string",                     // OBLIGATORIO
    "documentNumber": "string",           // OBLIGATORIO
    "address": "string",
    "phone": "string",
    "email": "string"
  },

  // Datos del emisor
  "issuerInfo": {
    "name": "string",
    "documentNumber": "string",
    "address": "string",
    "phone": "string",
    "email": "string"
  },

  // Líneas de factura
  "items": [                              // OBLIGATORIO - Al menos 1
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "discount": number,
      "tax": number,
      "subtotal": number,
      "total": number
    }
  ],

  // Totales
  "subtotal": number,                     // OBLIGATORIO
  "discountTotal": number,
  "taxTotal": number,
  "total": number,                        // OBLIGATORIO

  // Información de pago
  "paymentInfo": {
    "method": "EFECTIVO" | "TRANSFERENCIA" | "TARJETA" | "OTRO",
    "reference": "string",
    "status": "PENDING" | "PAID" | "OVERDUE" | "CANCELLED",
    "paidDate": "YYYY-MM-DD",
    "paidAmount": number
  },

  // Observaciones
  "notes": "string",
  "terms": "string",

  // Relación con paciente (opcional)
  "patientName": "string",
  "patientDocumentNumber": "string",
  "serviceType": "string",
  "servicePeriod": "string"
}
```

#### Validaciones:

- ✅ Número de factura único
- ✅ Fecha de factura obligatoria
- ✅ Información del cliente completa
- ✅ Al menos 1 línea de factura
- ✅ Totales calculados correctamente
- ✅ Total >= 0

---

## 🔄 Ejemplos de Peticiones API

### Crear Formulario (General)

```http
POST /api/v1/forms
Authorization: Bearer {token}
Content-Type: application/json

{
  "type": "FORMTYPE",
  "baseData": {
    // Campos de BaseForm
  },
  "specificData": {
    // Campos específicos del tipo de formulario
  }
}
```

### Respuesta Exitosa:

```json
{
  "id": "uuid",
  "type": "FORMTYPE",
  "title": "string",
  "status": "DRAFT",
  "version": 1,
  "createdBy": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "role": "UserRole"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
  // ... otros campos
}
```

### Enviar para Revisión:

```http
POST /api/v1/forms/workflow/{formId}/submit
Authorization: Bearer {token}
```

### Aprobar Formulario (Director):

```http
PATCH /api/v1/forms/workflow/{formId}/approve
Authorization: Bearer {token}
```

### Rechazar Formulario (Director):

```http
PATCH /api/v1/forms/workflow/{formId}/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Motivo del rechazo detallado"
}
```

### Obtener Mis Formularios:

```http
GET /api/v1/forms/workflow/my-forms?status=DRAFT
Authorization: Bearer {token}
```

### Obtener Notificaciones:

```http
GET /api/v1/forms/workflow/notifications?status=UNREAD&limit=20
Authorization: Bearer {token}
```

---

## ✅ Validaciones y Reglas de Negocio

### Reglas Generales:

1. **Creación de Formularios**:
   - Solo se puede crear si el rol tiene permisos para ese tipo
   - Siempre se crea en estado DRAFT
   - El usuario autenticado es el createdBy automáticamente

2. **Edición de Formularios**:
   - El creador puede editar si está en DRAFT o REJECTED
   - El director puede editar cualquier formulario
   - Director puede crear nuevas versiones

3. **Envío para Revisión**:
   - Solo desde DRAFT o REJECTED
   - El formulario debe pasar todas las validaciones específicas
   - Se notifica automáticamente al director

4. **Aprobación**:
   - Solo el director puede aprobar
   - Solo formularios en PENDING_REVIEW
   - Se genera notificación al creador
   - Se debe generar PDF (pendiente de implementar)

5. **Rechazo**:
   - Solo el director puede rechazar
   - Razón es obligatoria
   - Se notifica al creador con la razón
   - El formulario vuelve a estado editable

6. **Notificaciones**:
   - Se crean automáticamente en eventos del workflow
   - El usuario puede marcarlas como leídas
   - Se mantiene historial completo

7. **Auditoría**:
   - Todas las acciones se registran automáticamente
   - Se guarda quién, cuándo y qué cambió
   - Historial inmutable

---

## 📞 Soporte

Para dudas o problemas con la creación de formularios:

- Documentación API: `/api/docs`
- Contacto: equipo-desarrollo@andamiaje.com

---

**Última actualización**: 2025-01-XX
**Versión de API**: v1
**Versión de Formularios**: v2
