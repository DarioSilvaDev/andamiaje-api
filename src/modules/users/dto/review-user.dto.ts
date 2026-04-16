import { UserRole } from "@/commons/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class ReviewUserDto {
  @ApiProperty({
    description: "Define si la solicitud se aprueba o se rechaza",
    example: true,
  })
  @IsBoolean()
  approved: boolean;

  @ApiPropertyOptional({
    description: "Rol a asignar cuando la solicitud es aprobada",
    enum: UserRole,
  })
  @ValidateIf((dto) => dto.approved === true)
  @IsNotEmpty()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: "Motivo de rechazo cuando la solicitud es rechazada",
    example: "Falta documentación obligatoria",
  })
  @ValidateIf((dto) => dto.approved === false)
  @IsNotEmpty()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: "Observación adicional opcional",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
