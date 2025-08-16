import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Get, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '@/entities/user.entity';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y retorna tokens JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar token',
    description: 'Renueva el token de acceso usando el token de refresco',
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Token de refresco inválido',
  })
  async refreshToken(@Body('refreshToken') refreshToken: string): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener perfil del usuario',
    description: 'Retorna la información del usuario autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cerrar sesión',
    description: 'Invalida el token del usuario (implementación del lado del cliente)',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout exitoso',
  })
  async logout(): Promise<{ message: string }> {
    // En una implementación real, podrías agregar el token a una lista negra
    return { message: 'Logout exitoso' };
  }
} 