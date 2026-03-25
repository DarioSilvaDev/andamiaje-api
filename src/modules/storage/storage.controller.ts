import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  ForbiddenException,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "./storage.service";
import { CurrentUser } from "../auth";
import { User } from "@/entities";
import { AccountStatus } from "@/commons/enums";
import { Express } from "express"; // import explícito
import { RateLimitGuard, GeneralRateLimit } from "../auth/guards/rate-limit.guard";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Storage")
@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload")
  @UseGuards(RateLimitGuard)
  @GeneralRateLimit()
  @UseInterceptors(FileInterceptor("file"))
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Subir archivo",
    description: "Sube un archivo al almacenamiento en la nube",
  })
  @ApiResponse({
    status: 200,
    description: "Archivo subido correctamente",
  })
  @ApiResponse({
    status: 403,
    description: "Acceso denegado",
  })
  @ApiResponse({
    status: 429,
    description: "Demasiados intentos de subida",
  })
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Query("type") type: string
  ) {
    if (
      type !== "FIRMA_DIGITAL" &&
      user.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new ForbiddenException("Solo es posible la carga de firma digital");
    }
    const key = await this.storageService.uploadFile(file, type, user);
    return { message: "Archivo cargado correctamente", key };
  }

  @Get("download")
  async download(@Query("key") key: string) {
    return { url: await this.storageService.getSignedUrl(key) };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.storageService.findOne(+id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.storageService.remove(+id);
  }
}
