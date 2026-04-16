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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "./storage.service";
import { AllowPendingSignature, CurrentUser } from "../auth";
import { User } from "@/entities";
import { AccountStatus } from "@/commons/enums";
import { Express } from "express"; // import explícito

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload")
  @AllowPendingSignature()
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Query("type") type: string,
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
  async download(@CurrentUser() user: User, @Query("key") key: string) {
    return this.storageService.findOneByKey(key, user);
  }

  @Get("file/:key")
  findOne(@Param("key") key: string, @CurrentUser() user: User) {
    return this.storageService.findOneByKey(key, user);
  }

  @Delete("file")
  removeByQuery(@Query("key") key: string, @CurrentUser() user: User) {
    return this.storageService.removeByKey(key, user);
  }

  @Delete("file/:key")
  remove(@Param("key") key: string, @CurrentUser() user: User) {
    return this.storageService.removeByKey(key, user);
  }
}
