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
import { CurrentUser } from "../auth";
import { User } from "@/entities";
import { AccountStatus } from "@/commons/enums";
import { Express } from "express"; // import explícito

@Controller("storage")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Query("type") type: string
  ) {
    if (
      type !== "FIRMA_DIGITAL" &&
      user.accountStatus !== AccountStatus.ACTIVE
    ) {
      throw new ForbiddenException("Solo es posible cargar la firma digital.");
    }
    const key = await this.storageService.uploadFile(file, type, user);
    return { message: "Archivo cargado correctamente.", key };
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
