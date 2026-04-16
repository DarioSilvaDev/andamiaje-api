import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from "class-validator";

export class ReviewFormDto {
  @ApiProperty({
    description: "Indica si el formulario es aprobado",
    example: true,
  })
  @IsBoolean()
  approved: boolean;

  @ApiPropertyOptional({
    description: "Motivo obligatorio cuando la aprobación es rechazada",
  })
  @ValidateIf((dto) => dto.approved === false)
  @IsNotEmpty()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: "Comentario opcional del director",
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
