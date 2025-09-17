import { BadRequestException, Injectable } from "@nestjs/common";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { envs } from "@/config/envs";
import { User } from "@/entities";
import type { Express } from "express"; // import explícito

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket = envs.B2_BUCKET;

  private allowedMimeTypes = [
    "application/pdf", // documentos
    "image/png", // firma digital
    "image/jpeg", // firma digital
  ];

  constructor() {
    this.s3 = new S3Client({
      region: envs.B2_REGION,
      endpoint: `https://${envs.B2_ENDPOINT}`,
      credentials: {
        accessKeyId: envs.B2_KEY_ID,
        secretAccessKey: envs.B2_APP_KEY,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, type: string, user: User) {
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException("Tipo de archivo no permitido");
    }

    // Asignar carpeta según tipo
    const folder = this.mapTypeToFolder(type);
    if (!folder) {
      throw new BadRequestException("Tipo de documento no soportado");
    }

    const key = `${folder}/${user.documentNumber}-${Date.now()}-${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3.send(command);

    return {
      key,
      url: `https://${this.bucket}.${envs.B2_ENDPOINT}/${key}`,
    };
  }

  // Mapeo de tipos a carpetas
  private mapTypeToFolder(type: string): string | null {
    const map: Record<string, string> = {
      PLAN_TRABAJO: "plan_trabajo",
      INFORME_SEMESTRAL: "informes",
      INFORME_ADMISION: "informes",
      ACTAS: "actas",
      REPORTE_MENSUAL: "reportes",
      SEGUIMIENTO_ACOMPANANTE: "seguimiento_acompanante",
      SEGUIMIENTO_FAMILIA: "seguimiento_familia",
      FACTURA: "facturas",
      FIRMA_DIGITAL: "firmas",
    };

    return map[type] || null;
  }

  async getSignedUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: 3600 }); // 1h
  }

  findOne(id: number) {
    return `This action returns a #${id} storage`;
  }

  remove(id: number) {
    return `This action removes a #${id} storage`;
  }
}
