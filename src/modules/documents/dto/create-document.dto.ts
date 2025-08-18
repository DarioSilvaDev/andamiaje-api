import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { DocumentScope, DocumentType } from "@/entities/document.entity";

export class CreateDocumentFileDto {
  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsEnum(DocumentScope)
  scope: DocumentScope;

  @IsUUID()
  scopeEntityId: string;

  @IsOptional()
  content?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDocumentFileDto)
  attachments?: CreateDocumentFileDto[];
}
