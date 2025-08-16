import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '@/repositories/user.repository';
import { User, UserRole } from '@/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { envs } from '@/config/envs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userRepository.findByUsername(username) ||
                 await this.userRepository.findByEmail(username);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: envs.JWT_SECRET,
      expiresIn: envs.JWT_EXPIRES_IN,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: envs.JWT_REFRESH_SECRET,
      expiresIn: envs.JWT_REFRESH_EXPIRES_IN,
    });

    // Calcular tiempo de expiración en segundos
    const expiresIn = this.getExpirationTime(envs.JWT_EXPIRES_IN);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
      },
      expiresIn,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: envs.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const newPayload = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: envs.JWT_SECRET,
        expiresIn: envs.JWT_EXPIRES_IN,
      });

      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: envs.JWT_REFRESH_SECRET,
        expiresIn: envs.JWT_REFRESH_EXPIRES_IN,
      });

      const expiresIn = this.getExpirationTime(envs.JWT_EXPIRES_IN);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
        },
        expiresIn,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de refresco inválido');
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, { secret: envs.JWT_SECRET });
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  private getExpirationTime(expiresIn: string): number {
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 86400; // 24 horas por defecto
    }
  }
} 