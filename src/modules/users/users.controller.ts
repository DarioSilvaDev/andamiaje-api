import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Put,
  Delete,
  ParseIntPipe,
  UseGuards,
  // Patch,
  // UseInterceptors,
  // UploadedFile,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import {
  CurrentUser,
  OwnerCheck,
  OwnerGuard,
  Roles,
  RolesGuard,
} from "../auth";
import { User } from "@/entities";
import { ReviewUserDto } from "./dto/review-user.dto";
import { UserRole } from "@/commons/enums";
// import { FileInterceptor } from "@nestjs/platform-express";
// import { diskStorage } from "multer";
// import { extname } from "path";
// import { CurrentUser } from "../auth";
// import { User } from "@/entities";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.DIRECTOR)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@CurrentUser() user: User) {
    return this.usersService.findAll(user);
  }

  @Get("pending")
  @UseGuards(RolesGuard)
  @Roles(UserRole.DIRECTOR)
  findPendingUsers() {
    return this.usersService.findPendingApprovals();
  }

  @Patch(":id/review")
  @UseGuards(RolesGuard)
  @Roles(UserRole.DIRECTOR)
  reviewPendingUser(
    @Param("id", ParseIntPipe) id: number,
    @Body() reviewUserDto: ReviewUserDto,
  ) {
    return this.usersService.reviewPendingUser(id, reviewUserDto);
  }

  @Get(":id")
  @UseGuards(OwnerGuard)
  @OwnerCheck({
    entity: User,
    idField: "id",
    ownerField: "id",
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Put(":id")
  @UseGuards(OwnerGuard)
  @OwnerCheck({
    entity: User,
    idField: "id",
    ownerField: "id",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
  ) {
    return this.usersService.update(id, updateUserDto, user);
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
  @UseGuards(OwnerGuard)
  @OwnerCheck({
    entity: User,
    idField: "id",
    ownerField: "id",
  })
  remove(@Param("id", ParseIntPipe) id: number, @CurrentUser() user: User) {
    return this.usersService.remove(id, user);
  }
}
