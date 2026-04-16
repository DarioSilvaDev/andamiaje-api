import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description: "Refresh token opcional en body (preferido: cookie httpOnly)",
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
