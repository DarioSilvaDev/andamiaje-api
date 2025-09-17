import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { StorageService } from "./storage.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../auth";
import { User } from "@/entities";
import { AccountStatus } from "@/commons/enums";

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
    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new ForbiddenException("No podes cargar docu papu");
    }
    return this.storageService.uploadFile(file, type, user);
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
