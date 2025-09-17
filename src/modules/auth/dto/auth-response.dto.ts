import { AccountStatus, UserRole } from "@/commons/enums";
import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty({
    description: "Token de acceso JWT",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  accessToken: string;

  @ApiProperty({
    description: "Token de refresco JWT",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  refreshToken: string;

  @ApiProperty({
    description: "Información del usuario autenticado",
  })
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    accountStatus: AccountStatus;
  };

  @ApiProperty({
    description: "Tiempo de expiración del token en segundos",
    example: 86400,
  })
  expiresIn: number;
}
