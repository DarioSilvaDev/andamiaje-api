import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { envs } from "@/config/envs";
import { Document, User } from "@/entities";
import type { Express } from "express";
import { UserRepository } from "@/repositories";
import { AccountStatus, UserRole } from "@/commons/enums";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { StorageFileType } from "./enums/storage-file-type.enum";

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket = envs.B2_BUCKET;
  private logger = new Logger(StorageService.name);
  private allowedMimeTypes = [
    "application/pdf", // documentos
    "image/png", // firma digital
    "image/jpeg", // firma digital
  ];

  constructor(
    private readonly userRepository: UserRepository,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {
    this.s3 = new S3Client({
      region: envs.B2_REGION,
      endpoint: `https://${envs.B2_ENDPOINT}`,
      credentials: {
        accessKeyId: envs.B2_KEY_ID,
        secretAccessKey: envs.B2_APP_KEY,
      },
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    type: StorageFileType,
    user: User,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException("El archivo es obligatorio");
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException("Tipo de archivo no permitido");
    }

    // Asignar carpeta según tipo
    const folder = this.mapTypeToFolder(type);

    const key = `${folder}/${user.documentNumber}-${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    try {
      await this.s3.send(command);
      this.logger.log(
        `Archivo ${file.originalname} cargado correctamente en ${folder}`,
      );
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException(
        "No fue posible subir el documento",
      );
    }
    if (type === StorageFileType.FIRMA_DIGITAL) {
      await this.userRepository.updateUser(user.id, {
        accountStatus: AccountStatus.ACTIVE,
        firstLogin: false,
        digitalSignature: key,
        rejectionReason: null,
      });
    }
    return key;
  }

  async uploadBuffer(
    key: string,
    buffer: Buffer,
    contentType = "application/pdf",
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    try {
      await this.s3.send(command);
      this.logger.log(`Archivo ${key} cargado correctamente`);
      return key;
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException(
        "No fue posible subir el documento",
      );
    }
  }

  // Mapeo de tipos a carpetas
  private mapTypeToFolder(type: StorageFileType): string {
    const map: Record<StorageFileType, string> = {
      [StorageFileType.PLAN_TRABAJO]: "plan_trabajo",
      [StorageFileType.INFORME_SEMESTRAL]: "informes",
      [StorageFileType.INFORME_ADMISION]: "informes",
      [StorageFileType.ACTAS]: "actas",
      [StorageFileType.REPORTE_MENSUAL]: "reportes",
      [StorageFileType.SEGUIMIENTO_ACOMPANANTE]: "seguimiento_acompanante",
      [StorageFileType.SEGUIMIENTO_ACOMPANIANTE_EXTERNO]:
        "seguimiento_acompanante",
      [StorageFileType.SEGUIMIENTO_FAMILIA]: "seguimiento_familia",
      [StorageFileType.FACTURA]: "facturas",
      [StorageFileType.FIRMA_DIGITAL]: "firmas",
    };

    return map[type];
  }

  async getSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 }); // 1h
  }

  async findOneByKey(key: string, user: User) {
    const normalizedKey = this.normalizeKey(key);
    await this.assertKeyOwnership(normalizedKey, user);

    return {
      key: normalizedKey,
      url: await this.getSignedUrl(normalizedKey),
    };
  }

  async removeByKey(key: string, user: User) {
    const normalizedKey = this.normalizeKey(key);
    await this.assertKeyOwnership(normalizedKey, user);

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: normalizedKey,
    });

    try {
      await this.s3.send(command);
      return {
        message: "Archivo eliminado correctamente",
        key: normalizedKey,
      };
    } catch (error) {
      this.logger.error(error);
      throw new ServiceUnavailableException(
        "No fue posible eliminar el documento",
      );
    }
  }

  private normalizeKey(key: string): string {
    if (!key) {
      throw new BadRequestException("La key del archivo es obligatoria");
    }

    const normalized = decodeURIComponent(key).trim();

    if (!normalized) {
      throw new BadRequestException("La key del archivo es inválida");
    }

    return normalized;
  }

  private async assertKeyOwnership(key: string, user: User): Promise<void> {
    if (user.role === UserRole.DIRECTOR) {
      return;
    }

    if (user.digitalSignature && user.digitalSignature === key) {
      return;
    }

    if (key.includes(`${user.documentNumber}-`)) {
      return;
    }

    const linkedDocument = await this.documentRepository.findOne({
      where: { fileUrl: key },
      relations: ["createdBy"],
    });

    if (!linkedDocument) {
      throw new NotFoundException("Documento no encontrado");
    }

    if (!linkedDocument.createdBy || linkedDocument.createdBy.id !== user.id) {
      throw new ForbiddenException(
        "No tienes permisos para acceder a este archivo",
      );
    }
  }
}
