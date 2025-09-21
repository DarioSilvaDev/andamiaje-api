import { MODALITY_ENUM } from "@/commons/enums";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class ActaFormDto {
  @IsNotEmpty({ message: "El campo 'modality' es obligatorio" })
  @IsEnum(MODALITY_ENUM, {
    message: "El campo 'modality' debe ser VIRTUAL o PRESENCIAL",
  })
  modality: MODALITY_ENUM;

  @IsNotEmpty({ message: "El campo 'subject' es obligatorio" })
  @IsString({ message: "El campo 'subject' debe ser texto" })
  subject: string;
}
