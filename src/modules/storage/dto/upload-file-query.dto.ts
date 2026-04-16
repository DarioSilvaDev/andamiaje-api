import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { StorageFileType } from "../enums/storage-file-type.enum";

export class UploadFileQueryDto {
  @ApiProperty({
    description: "Tipo de documento para definir carpeta de almacenamiento",
    enum: StorageFileType,
    example: StorageFileType.FIRMA_DIGITAL,
  })
  @IsEnum(StorageFileType, {
    message: "El query param 'type' no corresponde a un tipo soportado",
  })
  type: StorageFileType;
}
