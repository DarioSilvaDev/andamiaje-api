import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { IsEnum, IsOptional } from "class-validator";
import { AccountStatus } from "@/commons/enums";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;
}
