import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Res,
  UnauthorizedException,
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
import { CurrentUser } from "./decorators/current-user.decorator";
import { User } from "@/entities/user.entity";
import { Request, Response } from "express";
import { RegisterDto } from "./dto/register.dto";
import { Public } from "./decorators/public.decorator";
import {
  clearAuthCookies,
  setAuthCookies,
} from "./utils/set-auth-cookies.util";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AllowPendingSignature } from "./decorators/allow-pending-signature.decorator";

@ApiTags("Autenticación")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Registrar usuario",
    description: "Crea una solicitud de registro pendiente de aprobación",
  })
  @ApiResponse({
    status: 201,
    description: "Solicitud de registro creada y pendiente de aprobación",
  })
  @ApiResponse({
    status: 400,
    description: "Error de validación",
  })
  async register(
    @Body()
    registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; status: string }> {
    clearAuthCookies(res);
    return this.authService.register(registerDto);
  }

  @Public()
  @Post("reapply")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Reaplicar registro",
    description:
      "Permite reenviar una solicitud de registro previamente rechazada",
  })
  @ApiResponse({
    status: 200,
    description: "Solicitud reenviada para revisión",
  })
  async reapply(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; status: string }> {
    clearAuthCookies(res);
    return this.authService.reapply(registerDto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Iniciar sesión",
    description: "Autentica un usuario y retorna tokens JWT",
  })
  @ApiResponse({
    status: 200,
    description: "Login exitoso",
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Credenciales inválidas",
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const authResponse = await this.authService.login(loginDto);

    setAuthCookies(res, authResponse);
    return authResponse;
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
    @Req() request: Request,
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const refreshTokenFromCookie = request.cookies?.refreshToken;
    const refreshToken = refreshTokenFromCookie || refreshTokenDto.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token no provisto");
    }

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
  @AllowPendingSignature()
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
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);
    clearAuthCookies(res);
  }
}
