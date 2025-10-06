import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Res,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "@/entities/user.entity";
import { Response } from "express";
import { RegisterDto } from "./dto/register.dto";
import { Public } from "./decorators/public.decorator";
import {
  clearAuthCookies,
  setAuthCookies,
} from "./utils/set-auth-cookies.util";

@ApiTags("Autenticación")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Registrar usuario",
    description: "Crea un nuevo usuario y retorna tokens JWT",
  })
  @ApiResponse({
    status: 201,
    description: "Usuario registrado exitosamente",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Error de validación",
  })
  async register(
    @Body()
    registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.register(registerDto);

    setAuthCookies(res, authResponse);
    return authResponse;
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Iniciar sesión",
    description: "Autentica un usuario y retorna tokens JWT",
  })
  @ApiResponse({
    status: 204,
    description: "Login exitoso",
  })
  @ApiResponse({
    status: 401,
    description: "Credenciales inválidas",
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const authResponse = await this.authService.login(loginDto);

    setAuthCookies(res, authResponse);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Renovar token",
    description: "Renueva el token de acceso usando el token de refresco",
  })
  @ApiResponse({
    status: 200,
    description: "Token renovado exitosamente",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Token de refresco inválido",
  })
  async refreshToken(
    @Body("refreshToken") refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.refreshToken(refreshToken);
    setAuthCookies(res, authResponse);
    return authResponse;
  }

  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obtener perfil del usuario",
    description: "Retorna la información del usuario autenticado",
  })
  @ApiResponse({
    status: 200,
    description: "Perfil del usuario",
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
  })
  async getProfile(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Post("logout")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: "Cerrar sesión",
    description:
      "Invalida el token del usuario (implementación del lado del cliente)",
  })
  @ApiResponse({
    status: 204,
    description: "Logout exitoso",
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    // En una implementación real, podrías agregar el token a una lista negra
    clearAuthCookies(res);
  }
}
