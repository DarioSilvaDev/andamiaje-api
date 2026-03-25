import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsObject,
  IsBoolean,
  IsNotEmpty,
  MaxLength,
} from "class-validator";
import { BaseForm } from "@/entities";

export class SubmitFormDto {
  @ApiPropertyOptional({
    description: "Notas adicionales al enviar el formulario",
    example: "Formulario listo para revisión",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RejectFormDto {
  @ApiProperty({
    description: "Razón del rechazo del formulario",
    example: "Faltan datos requeridos en la sección de diagnóstico",
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({
    description: "Comentarios adicionales sobre el rechazo",
    example:
      "Por favor, incluir el diagnóstico completo y fecha de inicio del tratamiento",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comments?: string;
}

export class EditFormDto {
  @ApiProperty({
    description: "Actualizaciones a aplicar al formulario",
    example: {
      title: "Nuevo título del formulario",
      notes: "Notas actualizadas",
      formData: {
        modality: "PRESENCIAL",
        subject: "Nuevo asunto de la reunión",
      },
    },
  })
  @IsObject()
  updates: Partial<BaseForm>;

  @ApiPropertyOptional({
    description: "Crear nueva versión en lugar de editar la actual",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  createNewVersion?: boolean;

  @ApiPropertyOptional({
    description: "Notas sobre la edición",
    example: "Actualización de datos del paciente",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  editNotes?: string;
}

export class CreateFormVersionDto {
  @ApiProperty({
    description: "Datos para la nueva versión del formulario",
  })
  @IsObject()
  formData: Record<string, any>;

  @ApiPropertyOptional({
    description: "Razón para crear nueva versión",
    example: "Corrección de datos del paciente",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

export class FormHistoryResponseDto {
  @ApiProperty({ description: "ID del log de auditoría" })
  id: string;

  @ApiProperty({ description: "Acción realizada" })
  action: string;

  @ApiProperty({ description: "Usuario que realizó la acción" })
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ description: "Descripción de la acción" })
  description?: string;

  @ApiProperty({ description: "Cambios realizados" })
  changes?: Record<string, any>;

  @ApiProperty({ description: "Metadatos adicionales" })
  metadata?: Record<string, any>;

  @ApiProperty({ description: "Fecha y hora de la acción" })
  createdAt: Date;
}

export class NotificationResponseDto {
  @ApiProperty({ description: "ID de la notificación" })
  id: string;

  @ApiProperty({ description: "Tipo de notificación" })
  type: string;

  @ApiProperty({ description: "Estado de la notificación" })
  status: string;

  @ApiProperty({ description: "Título de la notificación" })
  title: string;

  @ApiProperty({ description: "Mensaje de la notificación" })
  message: string;

  @ApiProperty({ description: "Formulario relacionado" })
  form: {
    id: string;
    title: string;
    type: string;
    status: string;
  };

  @ApiProperty({ description: "Usuario que envió la notificación" })
  sender: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };

  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @ApiPropertyOptional({ description: "Fecha de lectura" })
  readAt?: Date;
}

export class NotificationStatsDto {
  @ApiProperty({ description: "Total de notificaciones" })
  total: number;

  @ApiProperty({ description: "Notificaciones no leídas" })
  unread: number;

  @ApiProperty({ description: "Notificaciones leídas" })
  read: number;

  @ApiProperty({ description: "Notificaciones archivadas" })
  archived: number;

  @ApiProperty({ description: "Conteo por tipo de notificación" })
  byType: Record<string, number>;
}

export class FormWorkflowStatusDto {
  @ApiProperty({ description: "Estado actual del formulario" })
  status: string;

  @ApiProperty({ description: "Versión actual" })
  version: number;

  @ApiProperty({ description: "Usuario que creó el formulario" })
  createdBy: {
    id: number;
    firstName: string;
    lastName: string;
  };

  @ApiPropertyOptional({ description: "Usuario que aprobó el formulario" })
  approvedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };

  @ApiPropertyOptional({ description: "Usuario que rechazó el formulario" })
  rejectedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };

  @ApiPropertyOptional({ description: "Usuario que editó por última vez" })
  lastEditedBy?: {
    id: number;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @ApiPropertyOptional({ description: "Fecha de envío para revisión" })
  submittedAt?: Date;

  @ApiPropertyOptional({ description: "Fecha de aprobación" })
  approvedAt?: Date;

  @ApiPropertyOptional({ description: "Fecha de rechazo" })
  rejectedAt?: Date;

  @ApiPropertyOptional({ description: "Razón del rechazo" })
  rejectionReason?: string;

  @ApiProperty({ description: "Si el usuario puede editar el formulario" })
  canEdit: boolean;

  @ApiProperty({ description: "Si el usuario puede aprobar el formulario" })
  canApprove: boolean;

  @ApiProperty({ description: "Si el usuario puede rechazar el formulario" })
  canReject: boolean;
}
