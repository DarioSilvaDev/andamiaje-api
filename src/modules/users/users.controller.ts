import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  // Patch,
  // UseInterceptors,
  // UploadedFile,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { diskStorage } from "multer";
// import { extname } from "path";
// import { CurrentUser } from "../auth";
// import { User } from "@/entities";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // @Patch("/signature")
  // @UseInterceptors(
  //   FileInterceptor("digitalSignature", {
  //     storage: diskStorage({
  //       destination: "./uploads", // carpeta dentro del contenedor
  //       filename: (req, file, cb) => {
  //         const uniqueSuffix =
  //           Date.now() + "-" + Math.round(Math.random() * 1e9);
  //         cb(null, uniqueSuffix + extname(file.originalname));
  //       },
  //     }),
  //   })
  // )
  // uploadDigitalSignature(
  //   @CurrentUser() user: User,
  //   @UploadedFile() digitalSignature: Express.Multer.File
  // ) {
  //   return this.usersService.uploadDigitalSignature(user, digitalSignature);
  // }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
