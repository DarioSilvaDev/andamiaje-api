import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acceso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Token de refresco JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Información del usuario autenticado',
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: UserRole;
    isActive: boolean;
  };

  @ApiProperty({
    description: 'Tiempo de expiración del token en segundos',
    example: 86400,
  })
  expiresIn: number;
} 